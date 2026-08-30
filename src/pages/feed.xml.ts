import { getCollection } from "astro:content";
import { marked } from "marked";

import {
  absoluteUrl,
  formatXmlDate,
  postPath,
  SITE,
  smartTypography,
  sortPostsNewestFirst,
  xmlEscape,
} from "../lib/site";

export async function GET() {
  const posts = sortPostsNewestFirst(await getCollection("posts")).slice(0, 10);
  const entries = await Promise.all(
    posts.map(async (post) => {
      const path = postPath(post);
      const url = absoluteUrl(path);
      const id = url.endsWith("/") ? url.slice(0, -1) : url;
      const published = formatXmlDate(post.data.date);
      const content = await marked.parse(smartTypography(post.body ?? ""));

      return `<entry><title type="html">${xmlEscape(xmlEscape(smartTypography(post.data.title.trim())))}</title><link href="${xmlEscape(url)}" rel="alternate" type="text/html" title="${xmlEscape(smartTypography(post.data.title.trim()))}" /><published>${published}</published><updated>${published}</updated><id>${xmlEscape(id)}</id><content type="html" xml:base="${xmlEscape(url)}">${xmlEscape(content)}</content><author><name>${xmlEscape(SITE.author)}</name></author></entry>`;
    }),
  );
  const updated = formatXmlDate(posts[0].data.date);
  const feedUrl = absoluteUrl("/feed.xml");
  const homeUrl = absoluteUrl("/");
  const body = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><generator uri="https://astro.build/" version="7">Astro</generator><link href="${feedUrl}" rel="self" type="application/atom+xml" /><link href="${homeUrl}" rel="alternate" type="text/html" /><updated>${updated}</updated><id>${feedUrl}</id><title type="html">${xmlEscape(xmlEscape(SITE.title))}</title><subtitle>${xmlEscape(SITE.description)}</subtitle><author><name>${xmlEscape(SITE.author)}</name></author>${entries.join("")}</feed>`;

  return new Response(body, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
