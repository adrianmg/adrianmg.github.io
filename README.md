# adrianmato.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

Personal website and blog for Adrián Mato, Product Designer based in San Francisco. Built with Jekyll (not the scary doctor, the friendly static site generator 🧪) and hosted on Netlify.

[![adrianmato.com](/assets/preview.png)](https://adrianmato.com)

[Visit my website](https://adrianmato.com)

## Tech Stack

- **Static Site Generator**: Jekyll 3.8.4+ (because who needs a database anyway? 🤷)
- **Markup**: Kramdown (GitHub Flavored Markdown - now with 50% more flavor!)
- **Styling**: Custom Sass/SCSS (because plain CSS is so 2010)
- **Deployment**: Netlify (pushing to production has never been this easy)
- **Ruby Version**: 2.7.1 (aged like fine wine 🍷)

## Features

- Custom Jekyll theme
- Blog with article archive
- Responsive design
- SEO optimized (jekyll-seo-tag)
- XML sitemap generation
- RSS feed
- Social media integration (Twitter, Bluesky, LinkedIn, GitHub, Instagram)

## Development

### Prerequisites

- Ruby 2.7.1
- Bundler

### Setup

1. Clone the repository:
```bash
git clone https://github.com/adrianmg/adrianmg.github.io.git
cd adrianmg.github.io
```

2. Install dependencies (grab a ☕, this might take a minute):
```bash
bundle install
```

3. Run the development server:
```bash
bundle exec jekyll serve --livereload
```

4. Open your browser and visit `http://localhost:4000`

The `--livereload` flag enables automatic browser refresh when files change. It's like magic, but with more electrons! ⚡

## Project Structure

```
.
├── _config.yml          # Site configuration
├── _includes/           # Reusable HTML components
├── _layouts/            # Page templates
├── _posts/              # Blog posts (YYYY-MM-DD-title.md format)
├── _sass/               # Sass/SCSS stylesheets
├── assets/              # Static assets (images, CSS, JS)
├── blog.html            # Blog listing page
└── index.html           # Homepage
```

## Writing Blog Posts

Create a new file in `_posts/` with the format `YYYY-MM-DD-title.md`:

```markdown
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS
categories: [blog, design]
---

Your content here... (Pro tip: actual content required, lorem ipsum not accepted 😉)
```

## Deployment

The site automatically deploys to Netlify when changes are pushed to the main branch. Check the deployment status badge above for the current build status. 

⚠️ **Warning**: Pushing to `main` = instant production deploy. No pressure! 🚀

## License

See [LICENSE.txt](LICENSE.txt) for details.
