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
```

### Faster local builds with Bun

The committed `package-lock.json`, CI, and Netlify continue to use npm. After
installing dependencies with `npm ci`, Bun 1.3.13 or newer can run the same
scripts with lower startup overhead:

```sh
bun run dev
bun run build
bun run check
```

In local benchmarks, `bun run build` completed in 1.03 seconds versus 1.56
seconds with npm. Bun is an optional runner here, not a second package manager,
so do not commit a Bun lockfile.

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

The site-wide fallback card at `public/assets/og-image.png` is managed manually.
After replacing it, bump its `?v=` value in `src/lib/site.ts` so social crawlers
request the new image.
