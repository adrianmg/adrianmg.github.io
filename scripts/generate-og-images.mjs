#!/usr/bin/env node

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import React from "react";
import satori from "satori";
import twemoji from "twemoji";

const WIDTH = 1200;
const HEIGHT = 630;
const SCALE = 2;
const OUTPUT_WIDTH = WIDTH * SCALE;
const MAX_TITLE_GRAPHEMES = 110;
const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const postsDirectory = path.join(projectRoot, "_posts");
const previewDirectory = path.join(projectRoot, ".og-preview");
const generatedDirectory = path.join(projectRoot, "assets", "og", "posts");
const manifestPath = path.join(generatedDirectory, ".manifest.json");
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

function fontPath(family, file) {
  return path.join(projectRoot, "node_modules", "@fontsource", family, "files", file);
}

async function loadFonts() {
  return [
    {
      name: "Inter",
      data: await fs.readFile(fontPath("inter", "inter-latin-400-normal.woff")),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: await fs.readFile(fontPath("inter", "inter-latin-600-normal.woff")),
      weight: 600,
      style: "normal",
    },
    {
      name: "EB Garamond",
      data: await fs.readFile(
        fontPath("eb-garamond", "eb-garamond-latin-400-normal.woff"),
      ),
      weight: 400,
      style: "normal",
    },
  ];
}

function graphemes(value) {
  return Array.from(segmenter.segment(value), ({ segment }) => segment);
}

function normalizeTitle(title) {
  return title.replace(/\s+/g, " ").trim();
}

function truncateTitle(title) {
  const characters = graphemes(normalizeTitle(title));

  if (characters.length <= MAX_TITLE_GRAPHEMES) {
    return characters.join("");
  }

  const candidate = characters.slice(0, MAX_TITLE_GRAPHEMES - 1).join("");
  const lastSpace = candidate.lastIndexOf(" ");
  const cutoff = lastSpace >= MAX_TITLE_GRAPHEMES * 0.75 ? lastSpace : candidate.length;

  return `${candidate.slice(0, cutoff).trimEnd()}…`;
}

function postSlug(filename) {
  const match = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.(?:md|markdown)$/);

  if (!match) {
    throw new Error(`Post filename does not match Jekyll's dated format: ${filename}`);
  }

  return match[1];
}

async function loadPosts() {
  const entries = await fs.readdir(postsDirectory, { withFileTypes: true });
  const filenames = entries
    .filter((entry) => entry.isFile() && /\.(?:md|markdown)$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  return Promise.all(
    filenames.map(async (filename) => {
      const source = await fs.readFile(path.join(postsDirectory, filename), "utf8");
      const { data } = matter(source);

      if (typeof data.title !== "string" || !data.title.trim()) {
        throw new Error(`Post is missing a title: ${filename}`);
      }

      return {
        filename,
        hasCustomImage: Object.hasOwn(data, "image"),
        slug: postSlug(filename),
        title: normalizeTitle(data.title),
      };
    }),
  );
}

function titleCard(title) {
  const displayTitle = truncateTitle(title);

  return React.createElement(
    "div",
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        backgroundColor: "rgb(18, 18, 26)",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          position: "absolute",
          top: 64,
          left: 96,
          color: "rgb(242, 243, 251)",
          fontFamily: "Inter",
          fontSize: 76,
          fontWeight: 600,
          lineHeight: "96px",
        },
      },
      "Adrián Mato",
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          position: "absolute",
          top: 224,
          left: 96,
          width: 1008,
          color: "rgb(255, 184, 122)",
          fontFamily: "EB Garamond",
          fontSize: 48,
          fontWeight: 400,
          lineHeight: "64px",
        },
      },
      displayTitle,
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          position: "absolute",
          bottom: 64,
          left: 96,
          color: "rgb(145, 145, 161)",
          fontFamily: "Inter",
          fontSize: 32,
          fontWeight: 400,
          lineHeight: "48px",
        },
      },
      "adrianmato.com",
    ),
  );
}

async function loadEmoji(segment) {
  const codePoint = twemoji.convert.toCodePoint(segment);
  const source = await fs.readFile(
    path.join(projectRoot, "node_modules", "@twemoji", "svg", `${codePoint}.svg`),
    "utf8",
  );

  return `data:image/svg+xml;base64,${Buffer.from(source).toString("base64")}`;
}

async function renderCard(title, fonts) {
  const svg = await satori(titleCard(title), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
    loadAdditionalAsset: async (languageCode, segment) => {
      if (languageCode === "emoji") {
        return loadEmoji(segment);
      }

      return [];
    },
  });
  const renderer = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: OUTPUT_WIDTH,
    },
  });

  return renderer.render().asPng();
}

function previewPosts(posts) {
  const byTitleLength = [...posts].sort(
    (left, right) => graphemes(left.title).length - graphemes(right.title).length,
  );
  const latest = posts.at(-1);
  const representatives = [
    byTitleLength[0],
    byTitleLength[Math.floor(byTitleLength.length * 0.66)],
    latest,
    byTitleLength.at(-1),
  ];

  return Array.from(new Map(representatives.map((post) => [post.slug, post])).values());
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function writePreviewGallery(posts) {
  const figures = posts
    .map(
      (post) => `
        <figure>
          <img src="${post.slug}.png" alt="${escapeHtml(post.title)}">
          <figcaption>${escapeHtml(post.title)}</figcaption>
        </figure>`,
    )
    .join("");
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Open Graph image previews</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 24px;
        color: rgb(242, 243, 251);
        background: rgb(9, 9, 14);
        font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr));
        gap: 24px;
      }
      figure { margin: 0; }
      img {
        display: block;
        width: 100%;
        height: auto;
        border: 1px solid rgb(37, 37, 48);
      }
      figcaption {
        padding-top: 8px;
        color: rgb(145, 145, 161);
      }
    </style>
  </head>
  <body>
    <main>${figures}</main>
  </body>
</html>`;

  const outputPath = path.join(previewDirectory, "index.html");
  await fs.writeFile(outputPath, html);
  console.log(path.relative(projectRoot, outputPath));
}

async function rendererFingerprint() {
  const sourcePath = fileURLToPath(import.meta.url);
  const inputs = await Promise.all([
    fs.readFile(sourcePath),
    fs.readFile(path.join(projectRoot, "package-lock.json")),
  ]);
  const hash = createHash("sha256");

  for (const input of inputs) {
    hash.update(input);
  }

  return hash.digest("hex");
}

function imageFingerprint(post, rendererHash) {
  return createHash("sha256")
    .update(rendererHash)
    .update("\0")
    .update(post.slug)
    .update("\0")
    .update(post.title)
    .digest("hex");
}

async function loadManifest() {
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

    if (manifest.version !== 1 || typeof manifest.images !== "object") {
      throw new Error(`Unsupported OG image manifest: ${manifestPath}`);
    }

    return manifest;
  } catch (error) {
    if (error.code === "ENOENT") {
      return { version: 1, images: {} };
    }

    throw error;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function generateProductionImages(posts) {
  const previousManifest = await loadManifest();
  const rendererHash = await rendererFingerprint();
  const nextManifest = {
    version: 1,
    renderer: rendererHash,
    images: {},
  };
  const expectedFiles = new Set(posts.map((post) => `${post.slug}.png`));
  let fonts;
  let generated = 0;
  let reused = 0;

  for (const post of posts) {
    const outputPath = path.join(generatedDirectory, `${post.slug}.png`);
    const fingerprint = imageFingerprint(post, rendererHash);
    const canReuse =
      previousManifest.images[post.slug] === fingerprint && (await fileExists(outputPath));

    if (canReuse) {
      reused += 1;
    } else {
      fonts ??= await loadFonts();
      await fs.writeFile(outputPath, await renderCard(post.title, fonts));
      generated += 1;
    }

    nextManifest.images[post.slug] = fingerprint;
  }

  const generatedFiles = await fs.readdir(generatedDirectory, { withFileTypes: true });

  for (const entry of generatedFiles) {
    if (entry.isFile() && entry.name.endsWith(".png") && !expectedFiles.has(entry.name)) {
      await fs.unlink(path.join(generatedDirectory, entry.name));
    }
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);
  console.log(`OG images: ${generated} generated, ${reused} reused`);
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  const value = process.argv[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }

  return value;
}

async function main() {
  const isPreview = process.argv.includes("--preview");
  const posts = await loadPosts();
  const customTitle = argumentValue("--title");
  const customSlug = argumentValue("--slug") ?? "custom-preview";
  const selectedPosts = customTitle
    ? [{ filename: "", slug: customSlug, title: normalizeTitle(customTitle) }]
    : isPreview
      ? previewPosts(posts)
      : posts.filter((post) => !post.hasCustomImage);
  const outputDirectory = isPreview || customTitle ? previewDirectory : generatedDirectory;

  await fs.mkdir(outputDirectory, { recursive: true });

  if (isPreview || customTitle) {
    const fonts = await loadFonts();

    for (const post of selectedPosts) {
      const outputPath = path.join(outputDirectory, `${post.slug}.png`);
      const image = await renderCard(post.title, fonts);
      await fs.writeFile(outputPath, image);
      console.log(path.relative(projectRoot, outputPath));
    }

    if (isPreview && !customTitle) {
      await writePreviewGallery(selectedPosts);
    }
  } else {
    await generateProductionImages(selectedPosts);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
