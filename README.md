# adrianmato.com
[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

*Personal website based on Dr Jekyll and Mr Hide running a custom theme.*

## A Small Poem

```
In pixels and code, creativity flows,
Where design meets function, beauty grows.
From sketch to screen, ideas take flight,
Crafting experiences that feel just right.
```

[![adrianmato.com](/assets/preview.png)](https://adrianmato.com)

[Visit my website](https://adrianmato.com)

## Open Graph image previews

Install the Node dependencies, then generate representative title cards:

```sh
npm install
npm run og:preview
```

Preview images are written to `.og-preview/`. To test an unusually long title:

```sh
node scripts/generate-og-images.mjs \
  --title "A deliberately long blog post title" \
  --slug custom-preview
```

Production cards are rendered at 2400×1260 and committed with the site. New
posts only need their normal `title` front matter; the image path is derived
from the dated post filename.

After adding or retitling a post, generate and commit its card and the updated
manifest:

```sh
npm ci
npm run og:generate
git add assets/og/posts
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

The site-wide fallback card at `assets/og-image.png` is managed manually and is
never generated during Netlify builds. After replacing it, bump the `?v=` query
in `_config.yml` so social crawlers request the new image.
