import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import matter from "gray-matter";
import { parse, parseFragment, serialize } from "parse5";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

function elements(node) {
  return [
    ...(node.tagName ? [node] : []),
    ...(node.childNodes ?? []).flatMap(elements),
  ];
}

function attr(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}

function text(node) {
  return node.nodeName === "#text" ? node.value : (node.childNodes ?? []).map(text).join("");
}

function innerHtmlByClass(html, className) {
  const node = elements(parse(html)).find((node) =>
    attr(node, "class")?.split(/\s+/).includes(className),
  );
  assert(node, `Missing .${className}`);
  return serialize(node).trim();
}

function metadata(html, name) {
  const node = elements(parse(html)).find((node) =>
    node.tagName === "meta" && (attr(node, "property") ?? attr(node, "name")) === name,
  );
  assert(node, `Missing ${name}`);
  return attr(node, "content");
}

function decodeXml(value) {
  // Atom content is escaped once as XML, not parsed as HTML until decoded.
  return value.replace(/&(lt|gt|quot|apos|amp);/g, (_, entity) => ({
    lt: "<", gt: ">", quot: '"', apos: "'", amp: "&",
  })[entity]);
}

test("post authoring, feed, sitemap, and JSON-LD contracts", async (t) => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "astro-authoring-"));
  t.after(() => fs.rm(workspace, { recursive: true, force: true }));
  for (const file of [
    "src", "_posts", "public", "scripts", "astro.config.mjs",
    "package.json", "package-lock.json", "tsconfig.json",
  ]) {
    await fs.cp(path.join(root, file), path.join(workspace, file), { recursive: true });
  }
  await fs.symlink(path.join(root, "node_modules"), path.join(workspace, "node_modules"), "dir");

  function run(script, args = []) {
    return execFileSync(process.execPath, [script, ...args], {
      cwd: workspace,
      encoding: "utf8",
      stdio: "pipe",
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    });
  }
  function build() {
    run("node_modules/astro/bin/astro.mjs", ["build"]);
  }
  function check() {
    return run("scripts/check-site.mjs");
  }
  async function expectCheckFailure(file, transform, expected) {
    const filename = path.join(workspace, file);
    const original = await fs.readFile(filename, "utf8");
    try {
      await fs.writeFile(filename, transform(original));
      const result = spawnSync(process.execPath, ["scripts/check-site.mjs"], {
        cwd: workspace,
        encoding: "utf8",
      });
      assert.notEqual(result.status, 0, `Checker accepted invalid ${file}`);
      assert.match(result.stderr, expected);
    } finally {
      await fs.writeFile(filename, original);
    }
  }

  // The build needs CSS from a clean checkout, not an existing public artifact.
  run("node_modules/sass/sass.js", ["src/styles/main.scss", "public/assets/css/style.css", "--no-source-map"]);
  build();
  await t.test("the unmodified site satisfies its published contract", () => {
    assert.match(check(), /Site contract passed/);
  });
  const baselineSitemap = await fs.readFile(path.join(workspace, "dist/sitemap.xml"), "utf8");
  const baselineSitemapCount = [...baselineSitemap.matchAll(/<loc>/g)].length;
  const baselinePostFiles = (await fs.readdir(path.join(workspace, "_posts")))
    .filter((filename) => filename.endsWith(".md"));
  const baselineDates = await Promise.all(baselinePostFiles.map(async (filename) => {
    const { data } = matter(await fs.readFile(path.join(workspace, "_posts", filename), "utf8"));
    return Date.parse(`${data.date.replace(" ", "T")}Z`);
  }));
  const fixtureDate = new Date(Math.max(...baselineDates) + 1000)
    .toISOString().slice(0, 19).replace("T", " ");
  const expectedPostCount = baselinePostFiles.length + 1;
  const expectAddedPost = () => assert(
    check().includes(`Site contract passed: ${expectedPostCount} posts`),
  );

  const fixtureSlug = "authoring-regression";
  const filename = `${fixtureDate.slice(0, 10)}-${fixtureSlug}.md`;
  const route = `/blog/fixtures/${fixtureSlug}/`;
  const literalTitle = 'A </script><b id="jsonld-breakout">literal</b> title';
  const customPath = "/assets/og-image.png?author=O'Reilly&theme=dark";
  const prose = '"Quoted text" -- prose... with a contraction that isn\'t code.';
  const code = `const sample = "isn't changed -- ...";`;
  const body = `${prose}

## Repeated heading

## Repeated heading

\`\`\`js
${code}
\`\`\`

Inline code: \`isn't changed -- ...\`.

<span data-label="isn't changed -- ...">Raw HTML.</span>

[An internal link](/blog/)

![Artwork](/assets/og-image.png)
`;
  const summary = `${prose}\n\n\`\`\`js\n${code}\n\`\`\``;
  const source = matter.stringify(body, {
    title: literalTitle,
    date: fixtureDate,
    categories: ["blog", "fixtures"],
    summary,
    image: { path: customPath, width: 1200, height: 600 },
  });

  // Exercise an override on an existing generated card as well as a new post.
  const existingFile = path.join(workspace, "_posts/2026-08-26-teaching-my-agents-to-work-alongside-me.md");
  const existing = matter(await fs.readFile(existingFile, "utf8"));
  existing.data.image = { path: customPath, width: 1200, height: 600 };
  await fs.writeFile(existingFile, matter.stringify(existing.content, existing.data));
  await fs.writeFile(path.join(workspace, "_posts", filename), source);
  run("scripts/generate-og-images.mjs");
  build();

  await t.test("an additional post and existing-post override both build", async () => {
    expectAddedPost();
    const manifest = JSON.parse(await fs.readFile(path.join(workspace, "public/assets/og/posts/.manifest.json"), "utf8"));
    assert.equal(manifest.images[fixtureSlug], undefined);
    assert.equal(manifest.images["teaching-my-agents-to-work-alongside-me"], undefined);
    const html = await fs.readFile(path.join(workspace, "dist", route, "index.html"), "utf8");
    assert.equal(metadata(html, "og:image"), new URL(customPath, "https://adrianmato.com").href);
    assert.equal(metadata(html, "twitter:image"), new URL(customPath, "https://adrianmato.com").href);
    assert.equal(metadata(html, "og:image:width"), "1200");
    assert.equal(metadata(html, "og:image:height"), "600");
  });

  await t.test("custom image checks reject wrong metadata and missing artwork", async () => {
    const file = `dist${route}index.html`;
    await expectCheckFailure(file, (html) =>
      html.replace('property="og:image:width" content="1200"', 'property="og:image:width" content="2400"'),
    /Wrong Open Graph width/);
    await expectCheckFailure(file, (html) =>
      html.replace('property="og:image" content="https:', 'property="og:image" content="bad:'),
    /Wrong Open Graph image/);
    const art = path.join(workspace, "dist/assets/og-image.png");
    await fs.rename(art, `${art}.bak`);
    try {
      const result = spawnSync(process.execPath, ["scripts/check-site.mjs"], { cwd: workspace, encoding: "utf8" });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Broken local target/);
    } finally {
      await fs.rename(`${art}.bak`, art);
    }
  });

  await t.test("Atom uses actual page HTML; summaries and bodies preserve code", async () => {
    const html = await fs.readFile(path.join(workspace, "dist", route, "index.html"), "utf8");
    const feed = await fs.readFile(path.join(workspace, "dist/feed.xml"), "utf8");
    const entry = [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .map((match) => match[1]).find((entry) => entry.includes(`<id>https://adrianmato.com${route.slice(0, -1)}</id>`));
    assert(entry, "New post missing from Atom feed");
    const content = decodeXml(entry.match(/<content\b[^>]*>([\s\S]*?)<\/content>/)[1]).trim();
    const article = innerHtmlByClass(html, "post-content");
    assert.equal(serialize(parseFragment(content)).trim(), article);
    for (const part of [article, content, innerHtmlByClass(html, "post-summary")]) {
      const nodes = elements(parseFragment(part));
      assert(nodes.some((node) => node.tagName === "p" && text(node).includes("“Quoted text”")));
      assert.equal(text(nodes.find((node) => node.tagName === "pre")).trim(), code);
    }
    const raw = elements(parseFragment(content)).find((node) => node.tagName === "span");
    assert.equal(attr(raw, "data-label"), "isn't changed -- ...");
    assert(content.includes('id="repeated-heading-1"'));
  });

  await t.test("JSON-LD safely round-trips a literal closing script tag", async () => {
    const html = await fs.readFile(path.join(workspace, "dist", route, "index.html"), "utf8");
    const nodes = elements(parse(html));
    const scripts = nodes.filter((node) => node.tagName === "script" && attr(node, "type") === "application/ld+json");
    assert.equal(scripts.length, 1);
    assert.equal(JSON.parse(text(scripts[0])).headline, literalTitle);
    assert.equal(nodes.find((node) => attr(node, "id") === "jsonld-breakout"), undefined);
  });

  await t.test("known published URLs cannot silently move", async () => {
    const contractFile = "dist/sitemap.xml";
    const oldRoute = "/blog/personal/fixing-myself-as-a-maker/";
    await expectCheckFailure(contractFile, (xml) => xml.replace(oldRoute, "/blog/personal/moved/"),
      /Sitemap does not match built pages/);
    const oldFile = path.join(workspace, "dist", oldRoute, "index.html");
    await fs.rename(oldFile, `${oldFile}.bak`);
    try {
      const result = spawnSync(process.execPath, ["scripts/check-site.mjs"], { cwd: workspace, encoding: "utf8" });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Missing generated route/);
    } finally {
      await fs.rename(`${oldFile}.bak`, oldFile);
    }
  });

  // A build creates the new mini-site, but it must not be silently omitted.
  await fs.writeFile(path.join(workspace, "src/pages/review-mini-site.astro"),
    "<!doctype html><html lang=\"en\"><head><title>Mini-site</title></head><body>Mini-site</body></html>");
  build();
  await t.test("a new mini-site requires a sitemap decision", async () => {
    const result = spawnSync(process.execPath, ["scripts/check-site.mjs"], { cwd: workspace, encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Sitemap does not match built pages.*review-mini-site/);
  });

  const sitemapFile = path.join(workspace, "src/lib/sitemap.mjs");
  const sitemapSource = await fs.readFile(sitemapFile, "utf8");
  await fs.writeFile(sitemapFile, `${sitemapSource}\nSITEMAP_PAGES.push("/review-mini-site/");\n`);
  build();
  await t.test("explicitly including a new mini-site passes", () => {
    assert(check().includes(`${baselineSitemapCount + 2} sitemap routes`));
  });

  await fs.writeFile(sitemapFile,
    `${sitemapSource}\nSITEMAP_EXCLUSIONS["/review-mini-site/"] = "Unlisted preview";\n`);
  build();
  await t.test("a documented mini-site exclusion passes", () => {
    assert(check().includes(`${baselineSitemapCount + 1} sitemap routes`));
  });

  // A generated card still works when an author removes a custom override.
  const generated = matter(source);
  delete generated.data.image;
  generated.data.title = "Generated artwork";
  generated.data.redirect_from = "/old-authoring-example";
  await fs.writeFile(path.join(workspace, "_posts", filename), matter.stringify(generated.content, generated.data));
  run("scripts/generate-og-images.mjs");
  build();
  await t.test("removing an override generates artwork and supports a new redirect", async () => {
    expectAddedPost();
    const html = await fs.readFile(path.join(workspace, "dist", route, "index.html"), "utf8");
    assert.match(metadata(html, "og:image"), /authoring-regression\.png\?v=[a-f0-9]{8}$/);
    assert.equal(metadata(html, "og:image:width"), "2400");
    assert.equal(metadata(html, "og:image:height"), "1260");
    const redirect = await fs.readFile(path.join(workspace, "dist/old-authoring-example.html"), "utf8");
    assert(redirect.includes(`https://adrianmato.com${route}`));
  });
});
