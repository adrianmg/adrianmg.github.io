import { getCollection } from "astro:content";

import {
  absoluteUrl,
  postPath,
  postRedirects,
} from "../lib/site";

export async function GET() {
  const posts = await getCollection("posts");
  const redirects = Object.fromEntries(
    posts.flatMap((post) =>
      postRedirects(post).map((redirect) => [
        redirect,
        absoluteUrl(postPath(post)),
      ]),
    ),
  );

  return new Response(JSON.stringify(redirects), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
