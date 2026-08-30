#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

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

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
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

function localPath(value) {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("data:")
  ) {
    return undefined;
  }

  const url = new URL(value, SITE_URL);
  if (url.origin !== SITE_URL) return undefined;
  return url.pathname;
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

async function verifyLocalTargets(html, sourcePath) {
  const targets = extractValues(
    html,
    /\b(?:href|src|poster)=["']([^"']+)["']/gi,
  );
  targets.push(
    ...extractValues(
      html,
      /<meta\b[^>]*(?:name|property)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/gi,
    ),
  );

  for (const srcset of extractValues(html, /\bsrcset=["']([^"']+)["']/gi)) {
    targets.push(
      ...srcset.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]),
    );
  }

  for (const target of targets) {
    if (
      target === "./LICENSE" &&
      sourcePath.endsWith(path.join("markdown-demo", "index.html"))
    ) {
      continue;
    }

    const pathname = localPath(target);
    if (!pathname) continue;
    assert(
      await exists(routeFile(pathname)),
      `Broken local target ${target} in ${path.relative(projectRoot, sourcePath)}`,
    );
  }
}

const [posts, manifest] = await Promise.all([
  loadPosts(),
  fs.readFile(manifestPath, "utf8").then(JSON.parse),
]);

assert(posts.length === 16, `Expected 16 posts, found ${posts.length}`);

const postRoutes = posts.map(postPath);
const sitemapRoutes = [
  ...postRoutes,
  "/blog/",
  "/",
  "/markdown-demo/",
  "/pewpew/",
];
const requiredRoutes = [
  ...sitemapRoutes,
  "/404.html",
  "/feed.xml",
  "/robots.txt",
  "/sitemap.xml",
  ...posts.flatMap(({ data }) => {
    if (!data.redirect_from) return [];
    return Array.isArray(data.redirect_from)
      ? data.redirect_from
      : [data.redirect_from];
  }),
];

for (const route of requiredRoutes) {
  assert(await exists(routeFile(route)), `Missing generated route ${route}`);
}

for (const post of posts) {
  const html = await fs.readFile(routeFile(postPath(post)), "utf8");
  const fingerprint = manifest.images[post.slug];
  assert(fingerprint, `Missing Open Graph manifest entry for ${post.slug}`);
  assert(
    html.includes(
      `/assets/og/posts/${post.slug}.png?v=${fingerprint.slice(0, 8)}`,
    ),
    `Wrong Open Graph image for ${post.slug}`,
  );
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
  assert(!html.includes("<astro-island"), `Astro island emitted in ${htmlPath}`);
  assert(!html.includes("/_astro/"), `Bundled client asset emitted in ${htmlPath}`);
  await verifyLocalTargets(html, htmlPath);
}

const feed = await fs.readFile(routeFile("/feed.xml"), "utf8");
assert(
  feed.includes('<feed xmlns="http://www.w3.org/2005/Atom">'),
  "Feed is not Atom 1.0",
);
assert(
  (feed.match(/<entry>/g) ?? []).length === 10,
  "Feed must contain exactly 10 entries",
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
const expectedLocations = sitemapRoutes.map((route) => `${SITE_URL}${route}`).sort();
assert(
  JSON.stringify(sitemapLocations) === JSON.stringify(expectedLocations),
  "Sitemap route set changed",
);
const robots = await fs.readFile(routeFile("/robots.txt"), "utf8");
assert(
  robots.trim() === `Sitemap: ${SITE_URL}/sitemap.xml`,
  "robots.txt sitemap pointer changed",
);

for (const post of posts) {
  const redirects = post.data.redirect_from
    ? Array.isArray(post.data.redirect_from)
      ? post.data.redirect_from
      : [post.data.redirect_from]
    : [];

  for (const redirect of redirects) {
    const html = await fs.readFile(routeFile(redirect), "utf8");
    const destination = `${SITE_URL}${postPath(post)}`;
    assert(html.includes(`rel="canonical" href="${destination}"`), `Redirect canonical changed for ${redirect}`);
    assert(html.includes(`http-equiv="refresh"`), `Redirect refresh missing for ${redirect}`);
    assert(html.includes(`name="robots" content="noindex"`), `Redirect noindex missing for ${redirect}`);
  }
}

const oldestPost = await fs.readFile(routeFile(postRoutes[0]), "utf8");
assert(
  oldestPost.includes('datetime="2013-03-29T19:55:39-07:00"'),
  "Legacy UTC-to-Los-Angeles date behavior changed",
);

console.log(
  `Site contract passed: ${posts.length} posts, ${sitemapRoutes.length} sitemap routes, ${htmlFiles.length} HTML files.`,
);
