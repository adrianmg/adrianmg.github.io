# adrianmato.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

Personal website for Adrián Mato, Design Director at GitHub Copilot. Built with Jekyll and a custom theme.

[![adrianmato.com](/assets/preview.png)](https://adrianmato.com)

[Visit adrianmato.com](https://adrianmato.com)

## About

This is my personal website and blog, showcasing my work as a product designer and sharing thoughts on design, technology, and startups.

## Technical Stack

- **Static Site Generator**: Jekyll
- **Hosting**: Netlify
- **Ruby Version**: 2.7.1
- **Plugins**: 
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag
  - jekyll-redirect-from

## Local Development

### Prerequisites

- Ruby 2.7.1
- Bundler

### Setup

```bash
# Install dependencies
bundle install

# Run the development server
bundle exec jekyll serve --livereload

# The site will be available at http://localhost:4000
```

## Project Structure

- `_posts/` - Blog posts in Markdown format
- `_layouts/` - Page layouts
- `_includes/` - Reusable components
- `_sass/` - Stylesheets
- `assets/` - Images, fonts, and other static assets
- `_config.yml` - Jekyll configuration

## License

See [LICENSE.txt](LICENSE.txt) for details.
