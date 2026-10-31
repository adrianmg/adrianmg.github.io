import { getCollection } from "astro:content";
import { SITEMAP_PAGES, SITEMAP_EXCLUSIONS } from "../lib/sitemap.mjs";

import {
  absoluteUrl,
  formatXmlDate,
  parseLegacyDate,
  postPath,
  xmlEscape,
} from "../lib/site";

export async function GET() {
  const posts = [...(await getCollection("posts"))].sort(
    (left, right) =>
      parseLegacyDate(left.data.date).getTime() -
      parseLegacyDate(right.data.date).getTime(),
  );
  const postUrls = posts.filter((post) => !(postPath(post) in SITEMAP_EXCLUSIONS)).map(
    (post) =>
      `<url><loc>${xmlEscape(absoluteUrl(postPath(post)))}</loc><lastmod>${formatXmlDate(post.data.date)}</lastmod></url>`,
  );
  const pageUrls = SITEMAP_PAGES.filter((path) => !(path in SITEMAP_EXCLUSIONS)).map(
    (path) => `<url><loc>${xmlEscape(absoluteUrl(path))}</loc></url>`,
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...postUrls, ...pageUrls].join("\n")}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
