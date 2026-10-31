# adrianmato.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

Personal website built with Astro and deployed as static HTML.

[![adrianmato.com](/public/assets/preview.png)](https://adrianmato.com)

## Development

```sh
npm ci
npm run dev
```

The site uses Astro templates, Markdown content, Sass, and vanilla browser
JavaScript. It does not use a client-side UI framework or server rendering.

Useful commands:

```sh
npm run build       # Build CSS and the production site, then verify its contract
npm run check       # Type-check Astro and TypeScript
npm run css:watch   # Rebuild the fixed-path stylesheet while editing Sass
npm test           # Exercise authoring changes in a disposable copy of the site
```

## Authoring posts and pages

Add posts as dated `.md` files under `_posts/` with `title`,
`date` (a quoted `YYYY-MM-DD HH:mm:ss` timestamp), and ordered `categories`.
Generate their social cards with `npm run og:generate` before building.
The build accepts additional posts while protecting the existing URLs listed
in `scripts/fixtures/published-routes.json`; adding a post does not require
changing a count. The feed includes the newest ten posts.

Article bodies and the Atom feed use the same Astro-rendered content.
Summaries use the same Markdown processor and settings, including smart
punctuation for prose without altering code. Use public `/assets/` paths for
images in summaries.

For a new standalone page, add its public URL to `SITEMAP_PAGES` in
`src/lib/sitemap.mjs`, or add a documented `SITEMAP_EXCLUSIONS` entry if it
should not be listed. Post URLs are included automatically and legacy redirects
are excluded. The build independently compares the sitemap with all generated
HTML files, so a forgotten page fails with an actionable message.

### Faster local builds with Bun

The committed `package-lock.json`, CI, and Netlify continue to use npm. Install
dependencies only with `npm ci`, not `bun install`. Bun 1.3.13 or newer can
then run the same scripts with lower startup overhead:

```sh
bun run dev
bun run build
bun run check
```

In local benchmarks, `bun run build` was about 34% faster than npm. Bun is an
optional runner here, not a second package manager; Bun lockfiles are ignored
to keep `package-lock.json` authoritative.

## Open Graph image previews

Generate representative title cards:

```sh
npm run og:preview
```

Preview images are written to `.og-preview/`. To test an unusually long title:

```sh
node scripts/generate-og-images.mjs \
  --title "A deliberately long blog post title" \
  --slug custom-preview
```

Production cards are rendered at 2400×1260 and committed with the site. New
posts only need their normal `title` frontmatter; the image path is derived
from the dated post filename.

After adding or retitling a post, generate and commit its card and manifest:

```sh
npm run og:generate
git add public/assets/og/posts
```

The pull request check rejects stale generated cards. Netlify publishes the
committed images directly and does not regenerate them during deploys.

To use custom artwork for a post, add an `image` override:

```yaml
image:
  path: /assets/images/custom-social-card.png
  width: 2400
  height: 1260
```

Run `npm run og:generate` after setting or removing an override to refresh the
manifest and remove any unused generated card. The build validates the override
URL and dimensions instead of requiring a generated image for that post.
Local image paths must exist; external image availability is not checked by the
offline build.

The site-wide fallback card at `public/assets/og-image.png` is managed manually.
After replacing it, bump its `?v=` value in `src/lib/site.ts` so social crawlers
request the new image.
