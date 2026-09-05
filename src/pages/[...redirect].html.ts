import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import {
  absoluteUrl,
  postPath,
  postRedirects,
} from "../lib/site";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.flatMap((post) =>
    postRedirects(post).map((redirect) => ({
      params: { redirect: redirect.slice(1) },
      props: { destination: absoluteUrl(postPath(post)) },
    })),
  );
}

export const GET: APIRoute = ({ props }) => {
  const destination = props.destination;
  const body = `<!DOCTYPE html>
<html lang="en-US">
  <meta charset="utf-8">
  <title>Redirecting&hellip;</title>
  <link rel="canonical" href="${destination}">
  <script>location="${destination}"</script>
  <meta http-equiv="refresh" content="0; url=${destination}">
  <meta name="robots" content="noindex">
  <h1>Redirecting&hellip;</h1>
  <a href="${destination}">Click here if you are not redirected.</a>
</html>
`;

  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
