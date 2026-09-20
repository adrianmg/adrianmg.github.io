# adrianmato.com
[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

*Personal website of Adrián Mato. Designing and building AI tools for developers at GitHub.*

[![adrianmato.com](/assets/preview.png)](https://adrianmato.com)

Built with Jekyll and hosted on Netlify. Features work portfolio, blog posts about design and development, and projects including [github-pewpew](https://github.com/adrianmg/github-pewpew).

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
