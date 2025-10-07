# adrianmato.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

> Personal website and blog built with Jekyll, featuring a custom theme and deployed on Netlify.

[![adrianmato.com](/assets/preview.png)](https://adrianmato.com)

[Visit my website →](https://adrianmato.com)

## 🚀 Quick Start

### Prerequisites

- Ruby 2.7.1 (see `.ruby-version`)
- Bundler (`gem install bundler`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adrianmg/adrianmg.github.io.git
   cd adrianmg.github.io
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

### Local Development

Run the development server with live reload:

```bash
bundle exec jekyll serve --livereload
```

The site will be available at `http://localhost:4000`

## 📁 Project Structure

```
.
├── _config.yml          # Site configuration
├── _includes/           # Reusable components (header, footer, etc.)
├── _layouts/            # Page templates
├── _posts/              # Blog posts (Markdown files)
├── _sass/               # Sass stylesheets
├── assets/              # Static assets (images, CSS, JS)
├── blog.html            # Blog listing page
├── index.html           # Homepage
└── pewpew.html          # GitHub pewpew project page
```

## ✍️ Creating Content

### Writing Blog Posts

Create a new file in `_posts/` with the naming convention:

```
YYYY-MM-DD-title-of-post.md
```

Example front matter:

```yaml
---
layout: post
title: "Your Post Title"
date: 2025-01-31 09:30:00
categories: [blog, design, technology]
---
```

### Adding Pages

Create HTML or Markdown files in the root directory with appropriate front matter.

## 🛠 Technology Stack

- **Static Site Generator**: [Jekyll](https://jekyllrb.com/)
- **Markdown Parser**: [Kramdown](https://kramdown.gettalong.org/) with GFM support
- **Deployment**: [Netlify](https://www.netlify.com/)
- **Analytics**: [Umami](https://umami.is/)

### Jekyll Plugins

- `jekyll-feed` - RSS feed generation
- `jekyll-sitemap` - Automatic sitemap generation
- `jekyll-seo-tag` - SEO meta tags
- `jekyll-redirect-from` - Page redirects

## 🚢 Deployment

The site is automatically deployed to Netlify when changes are pushed to the `master` branch. The build command is handled by Netlify's automatic Jekyll detection.

### Build Locally

```bash
bundle exec jekyll build
```

The static site will be generated in the `_site/` directory.

## 🤝 Contributing

This is a personal website, but if you notice any issues or have suggestions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE.txt](LICENSE.txt) for details.

---

Built with ❤️ by [Adrián Mato](https://adrianmato.com)
