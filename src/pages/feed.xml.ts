import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer as getMdxRenderer } from "@astrojs/mdx/container-renderer";

import {
  absoluteUrl,
  formatXmlDate,
  postPath,
  SITE,
  smartTypography,
  sortPostsNewestFirst,
  xmlEscape,
} from "../lib/site";

// Feed readers get the article as plain content: interactive demos fall back
// to their static image, scripts and component styles are dropped, and local
// links and media point at the live site.
function feedHtml(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<form\b[^>]*class="playground-controls"[\s\S]*?<\/form>/gi, "")
    .replace(/\s(src|href|poster)="(\/(?!\/)[^"]*)"/g, (_, name, value) => ` ${name}="${absoluteUrl(value)}"`)
    .replace(/\ssrcset="([^"]*)"/g, (_, value: string) =>
      ` srcset="${value.replace(/(^|,\s*)(\/(?!\/)[^\s,]+)/g, (__, lead, url) => `${lead}${absoluteUrl(url)}`)}"`);
}

export async function GET() {
  const posts = sortPostsNewestFirst(await getCollection("posts")).slice(0, 10);
  // MDX posts render through their own renderer, so the container needs it too.
  const renderers = await loadRenderers([getMdxRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const entries = await Promise.all(
    posts.map(async (post) => {
      const path = postPath(post);
      const url = absoluteUrl(path);
      const id = url.endsWith("/") ? url.slice(0, -1) : url;
      const published = formatXmlDate(post.data.date);
      const { Content } = await render(post);
      const content = feedHtml(await container.renderToString(Content));

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
