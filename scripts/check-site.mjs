#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import { parse } from "parse5";
import { SITEMAP_EXCLUSIONS } from "../src/lib/sitemap.mjs";

const SITE_URL = "https://adrianmato.com";
const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDirectory = path.join(projectRoot, "dist");
const postsDirectory = path.join(projectRoot, "_posts");
const manifestPath = path.join(
  projectRoot,
  "public",
  "assets",
  "og",
  "posts",
  ".manifest.json",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function isFile(filePath) {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function postSlug(filename) {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/\.(?:md|markdown)$/, "");
}

function postPath(post) {
  return `/${[...post.data.categories, post.slug].join("/")}/`;
}

function routeFile(pathname) {
  if (pathname === "/") return path.join(distDirectory, "index.html");
  if (pathname.endsWith("/")) {
    return path.join(distDirectory, pathname.slice(1), "index.html");
  }
  if (path.extname(pathname)) return path.join(distDirectory, pathname.slice(1));
  return path.join(distDirectory, pathname.slice(1), "index.html");
}

function routePath(filePath) {
  const relative = path.relative(distDirectory, filePath).split(path.sep).join("/");
  return `/${relative}`.replace(/index\.html$/, "");
}

function elements(node) {
  return [
    ...(node.tagName ? [node] : []),
    ...(node.childNodes ?? []).flatMap(elements),
  ];
}

function attribute(node, name) {
  return node.attrs?.find((attr) => attr.name === name)?.value;
}

function meta(nodes, name) {
  const matches = nodes.filter(
    (node) =>
      node.tagName === "meta" &&
      (attribute(node, "property") ?? attribute(node, "name")) === name,
  );
  assert(matches.length === 1, `Expected one ${name} meta tag, found ${matches.length}`);
  return attribute(matches[0], "content");
}

function redirectsFor(post) {
  const value = post.data.redirect_from;
  return (value ? (Array.isArray(value) ? value : [value]) : []).map(
    (redirect) => redirect.startsWith("/") ? redirect : `/${redirect}`,
  );
}

async function loadPosts() {
  const filenames = (await fs.readdir(postsDirectory))
    .filter((filename) => /\.(?:md|markdown)$/.test(filename))
    .sort();

  return Promise.all(
    filenames.map(async (filename) => {
      const source = await fs.readFile(path.join(postsDirectory, filename), "utf8");
      const { data, content } = matter(source);
      assert(!/\{\{|\{%|\{:\./.test(content), `Legacy syntax remains in ${filename}`);
      return { filename, slug: postSlug(filename), data };
    }),
  );
}

function extractValues(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

async function verifyLocalTargets(nodes, sourcePath) {
  const targets = [];
  for (const node of nodes) {
    for (const name of ["href", "src", "poster"]) {
      const value = attribute(node, name);
      if (value) targets.push(value);
    }
    const srcset = attribute(node, "srcset");
    if (srcset && !srcset.startsWith("data:")) {
      targets.push(...srcset.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]));
    }
    if (
      node.tagName === "meta" &&
      ["og:image", "twitter:image"].includes(attribute(node, "property") ?? attribute(node, "name"))
    ) {
      targets.push(attribute(node, "content"));
    }
  }

  for (const target of targets) {
    // This borrowed Markdown example has always linked to a nonexistent license.
    if (
      target === "./LICENSE" &&
      sourcePath.endsWith(path.join("markdown-demo", "index.html"))
    ) {
      continue;
    }

    if (!target || target.startsWith("#")) continue;
    const url = new URL(target, `${SITE_URL}${routePath(sourcePath)}`);
    if (url.origin !== SITE_URL) continue;
    const pathname = decodeURIComponent(url.pathname);
    const file = routeFile(pathname);
    const extensionless = !path.extname(pathname) && !pathname.endsWith("/");
    assert(
      await isFile(file) || (extensionless && await isFile(path.join(distDirectory, `${pathname.slice(1)}.html`))),
      `Broken local target ${target} in ${path.relative(projectRoot, sourcePath)}`,
    );
  }
}

const [posts, manifest] = await Promise.all([
  loadPosts(),
  fs.readFile(manifestPath, "utf8").then(JSON.parse),
]);

assert(posts.length > 0, "The blog must contain at least one post");

const postRoutes = posts.map(postPath);
assert(new Set(postRoutes).size === postRoutes.length, "Duplicate Post URLs");
const publishedRoutes = JSON.parse(
  await fs.readFile(path.join(projectRoot, "scripts/fixtures/published-routes.json"), "utf8"),
);
const redirectRoutes = posts.flatMap((post) => redirectsFor(post).map((redirect) => `${redirect}.html`));
const requiredRoutes = [
  ...publishedRoutes,
  ...postRoutes,
  "/404.html",
  "/feed.xml",
  "/robots.txt",
  "/sitemap.xml",
  "/redirects.json",
  "/LICENSE.txt",
  ...redirectRoutes,
];

for (const route of requiredRoutes) {
  assert(await isFile(routeFile(route)), `Missing generated route ${route}`);
}

for (const post of posts) {
  const html = await fs.readFile(routeFile(postPath(post)), "utf8");
  const nodes = elements(parse(html));
  let image = post.data.image;
  if (!image) {
    const fingerprint = manifest.images[post.slug];
    assert(fingerprint, `Missing Open Graph manifest entry for ${post.slug}`);
    image = {
      path: `/assets/og/posts/${post.slug}.png?v=${fingerprint.slice(0, 8)}`,
      width: 2400,
      height: 1260,
    };
  }
  const imageUrl = new URL(image.path, SITE_URL).href;
  assert(meta(nodes, "og:image") === imageUrl, `Wrong Open Graph image for ${post.slug}`);
  assert(meta(nodes, "twitter:image") === imageUrl, `Wrong Twitter image for ${post.slug}`);
  assert(meta(nodes, "og:image:width") === String(image.width), `Wrong Open Graph width for ${post.slug}`);
  assert(meta(nodes, "og:image:height") === String(image.height), `Wrong Open Graph height for ${post.slug}`);
  assert(
    html.includes(`<link rel="canonical" href="${SITE_URL}${postPath(post)}">`),
    `Wrong canonical URL for ${post.slug}`,
  );
}

const htmlFiles = [];
async function collectHtml(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectHtml(entryPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(entryPath);
  }
}
await collectHtml(distDirectory);

for (const htmlPath of htmlFiles) {
  const html = await fs.readFile(htmlPath, "utf8");
  const nodes = elements(parse(html));
  assert(!html.includes("<astro-island"), `Astro island emitted in ${htmlPath}`);
  assert(!html.includes("/_astro/"), `Bundled client asset emitted in ${htmlPath}`);
  for (const node of nodes.filter((node) =>
    node.tagName === "script" && attribute(node, "type") === "application/ld+json",
  )) {
    const json = node.childNodes.map((node) => node.value ?? "").join("");
    JSON.parse(json);
  }
  await verifyLocalTargets(nodes, htmlPath);
}

const feed = await fs.readFile(routeFile("/feed.xml"), "utf8");
assert(
  feed.includes('<feed xmlns="http://www.w3.org/2005/Atom">'),
  "Feed is not Atom 1.0",
);
assert(
  (feed.match(/<entry>/g) ?? []).length === Math.min(posts.length, 10),
  "Feed must contain the 10 newest posts (or all posts when fewer exist)",
);
for (const post of [...posts]
  .sort(
    (left, right) =>
      Date.parse(`${right.data.date.replace(" ", "T")}Z`) -
      Date.parse(`${left.data.date.replace(" ", "T")}Z`),
  )
  .slice(0, 10)) {
  const url = `${SITE_URL}${postPath(post)}`;
  assert(feed.includes(`<link href="${url}" rel="alternate"`), `Feed link missing ${url}`);
  assert(
    feed.includes(`<id>${url.slice(0, -1)}</id>`),
    `Stable feed ID missing for ${url}`,
  );
}

const sitemap = await fs.readFile(routeFile("/sitemap.xml"), "utf8");
const sitemapLocations = extractValues(sitemap, /<loc>([^<]+)<\/loc>/g).sort();
for (const [excluded, reason] of Object.entries(SITEMAP_EXCLUSIONS)) {
  assert(typeof reason === "string" && reason.trim(), `Missing sitemap exclusion reason for ${excluded}`);
  assert(await isFile(routeFile(excluded)), `Sitemap exclusion does not resolve: ${excluded}`);
}
// Compare with actual output, not the inclusion list used by the sitemap writer.
const sitemapRoutes = htmlFiles.map(routePath).filter(
  (route) => !redirectRoutes.includes(route) && !(route in SITEMAP_EXCLUSIONS),
);
const expectedLocations = sitemapRoutes.map((route) => `${SITE_URL}${route}`).sort();
assert(
  JSON.stringify(sitemapLocations) === JSON.stringify(expectedLocations),
  `Sitemap does not match built pages. Missing: ${expectedLocations.filter((url) => !sitemapLocations.includes(url)).join(", ")}. Unexpected: ${sitemapLocations.filter((url) => !expectedLocations.includes(url)).join(", ")}. Update src/lib/sitemap.mjs or add a reasoned exclusion.`,
);
const robots = await fs.readFile(routeFile("/robots.txt"), "utf8");
assert(
  robots.trim() === `Sitemap: ${SITE_URL}/sitemap.xml`,
  "robots.txt sitemap pointer changed",
);

for (const post of posts) {
  const redirects = redirectsFor(post);

  for (const redirect of redirects) {
    const html = await fs.readFile(routeFile(`${redirect}.html`), "utf8");
    const destination = `${SITE_URL}${postPath(post)}`;
    assert(html.includes(`rel="canonical" href="${destination}"`), `Redirect canonical changed for ${redirect}`);
    assert(html.includes(`http-equiv="refresh"`), `Redirect refresh missing for ${redirect}`);
    assert(html.includes(`name="robots" content="noindex"`), `Redirect noindex missing for ${redirect}`);
  }
}

const redirectsJson = JSON.parse(
  await fs.readFile(routeFile("/redirects.json"), "utf8"),
);
for (const post of posts) {
  const redirects = redirectsFor(post);
  for (const redirect of redirects) {
    assert(
      redirectsJson[redirect] === `${SITE_URL}${postPath(post)}`,
      `redirects.json entry changed for ${redirect}`,
    );
  }
}

const oldestPost = await fs.readFile(
  routeFile("/blog/design/opinion/designer-dont-blame-the-client-its-your-fault/"),
  "utf8",
);
assert(
  oldestPost.includes('datetime="2013-03-29T19:55:39-07:00"'),
  "Legacy UTC-to-Los-Angeles date behavior changed",
);

console.log(
  `Site contract passed: ${posts.length} posts, ${sitemapRoutes.length} sitemap routes, ${htmlFiles.length} HTML files.`,
);
