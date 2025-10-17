# adrianmato.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

Personal website and blog of Adrián Mato, Design Director at GitHub Copilot and startup investor. Built with Jekyll and hosted on Netlify.

[![adrianmato.com](/assets/preview.png)](https://adrianmato.com)

[Visit the website →](https://adrianmato.com)

## 🚀 About

This is the source code for my personal website at [adrianmato.com](https://adrianmato.com). The site features a portfolio of my work, blog posts about design, development, and product management, and ways to connect with me.

## 🛠️ Technology Stack

- **Static Site Generator:** [Jekyll](https://jekyllrb.com/) 3.8.4+
- **Language:** Ruby 2.7.1
- **Styling:** Custom Sass/CSS
- **Deployment:** [Netlify](https://www.netlify.com/)
- **Jekyll Plugins:**
  - jekyll-feed - RSS feed generation
  - jekyll-sitemap - XML sitemap generation
  - jekyll-seo-tag - SEO optimization
  - jekyll-redirect-from - URL redirects

## 📋 Prerequisites

- Ruby 2.7.1 (specified in `.ruby-version`)
- Bundler gem
- Basic knowledge of Jekyll and Markdown

## 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adrianmg/adrianmg.github.io.git
   cd adrianmg.github.io
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Run the development server:**
   ```bash
   bundle exec jekyll serve --livereload
   ```

4. **Open your browser:**
   Navigate to `http://localhost:4000` to see the site.

## 📝 Development

### Project Structure

```
.
├── _config.yml          # Jekyll configuration
├── _includes/           # Reusable HTML components
├── _layouts/            # Page templates
├── _posts/              # Blog posts (Markdown)
├── _sass/               # Sass stylesheets
├── assets/              # Static assets (images, CSS, JS)
├── blog.html            # Blog listing page
├── index.html           # Homepage
└── README.md            # This file
```

### Writing Blog Posts

Blog posts are stored in the `_posts/` directory and follow the naming convention: `YYYY-MM-DD-title-slug.md`

Example:
```markdown
---
layout: post
title: "Your Post Title"
date: 2024-01-01
categories: blog
---

Your content here...
```

### Live Reload

The development server includes live reload functionality. Changes to files will automatically refresh your browser.

## 🚀 Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch. The deployment status can be monitored via the badge at the top of this README.

### Manual Build

To build the site manually:
```bash
bundle exec jekyll build
```

The built site will be in the `_site/` directory.

## 📄 License

See [LICENSE.txt](LICENSE.txt) for details.

## 📬 Contact

- **Website:** [adrianmato.com](https://adrianmato.com)
- **Email:** hello@adrianmato.com
- **Twitter/X:** [@adrianmg](https://twitter.com/adrianmg)
- **Bluesky:** [adrianmato.com](https://bsky.app/profile/adrianmato.com)
- **LinkedIn:** [adrianmg](https://linkedin.com/in/adrianmg)
- **GitHub:** [adrianmg](https://github.com/adrianmg)
