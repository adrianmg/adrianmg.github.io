# adrianmato.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/9482eaf2-54d5-4ee5-a190-5da6e2226aeb/deploy-status)](https://app.netlify.com/sites/adrianmato/deploys)

> Personal website and blog built with Jekyll, featuring a custom theme and deployed on Netlify.

[![adrianmato.com](/assets/preview.png)](https://adrianmato.com)

[Visit my website →](https://adrianmato.com)

## 🚀 Quick Start (Buckle up, buttercup!)

### Prerequisites (aka "The Boring But Necessary Stuff")

- Ruby 2.7.1 (see `.ruby-version`) - _the sparkly gem that makes magic happen_
- Bundler (`gem install bundler`) - _your friendly dependency wrangler_

### Installation (The "Copy-Paste Paradise")

1. Clone the repository (fancy talk for "download the thing"):
   ```bash
   git clone https://github.com/adrianmg/adrianmg.github.io.git
   cd adrianmg.github.io
   ```
   
   Or fork the repository and clone your fork.

2. Install dependencies (patience is a virtue, grab some ☕):
   ```bash
   bundle install
   ```

### Local Development (Where the Magic Happens ✨)

Run the development server with live reload (it's like having a personal butler for your code):

```bash
bundle exec jekyll serve --livereload
```

The site will be available at `http://localhost:4000`

> **Pro tip**: If you get a "port already in use" error, it means you already have Jekyll running... or you're hosting a secret underground server. We won't judge.

## 📁 Project Structure (The Grand Tour!)

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

> **Fun fact**: The `_sass` folder contains Sass files, not actual sass. Though your CSS might be sassy enough on its own.

## ✍️ Creating Content (Unleash Your Inner Shakespeare!)

### Writing Blog Posts (Share Your Wisdom With The World)

Create a new file in `_posts/` with the naming convention (be precise, Jekyll is picky!):

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

### Adding Pages (Expand Your Digital Empire!)

Create HTML or Markdown files in the root directory with appropriate front matter (it's like a VIP pass for your content).

> **Developer humor**: YAML front matter is called "front matter" because if you put it at the back, Jekyll gets confused. Kind of like wearing your shirt backwards. It technically works, but everyone will stare.

## 🛠 Technology Stack (The Dream Team!)

- **Static Site Generator**: [Jekyll](https://jekyllrb.com/) - _the OG static site wizard 🧙‍♂️_
- **Markdown Parser**: [Kramdown](https://kramdown.gettalong.org/) with GFM support - _because plain text deserves superpowers_
- **Deployment**: [Netlify](https://www.netlify.com/) - _deploy o'clock is any o'clock_
- **Analytics**: [Umami](https://umami.is/) - _delicious data insights_ 🍜

### Jekyll Plugins (The Avengers of Jekyll!)

- `jekyll-feed` - RSS feed generation _(nom nom nom)_
- `jekyll-sitemap` - Automatic sitemap generation _(Google's treasure map)_
- `jekyll-seo-tag` - SEO meta tags _(making search engines swoon)_
- `jekyll-redirect-from` - Page redirects _(the ultimate "you are here" sign)_

> **Did you know?** Jekyll was named after Dr. Jekyll and Mr. Hyde. Fitting, since your site can transform from development to production faster than Jekyll's famous potion. 🧪

## 🚢 Deployment (Set Sail for Production!)

The site is automatically deployed to Netlify when changes are pushed to the `master` branch. The build command is handled by Netlify's automatic Jekyll detection (it's basically psychic 🔮).

### Build Locally (Cook Your Own Pixels!)

```bash
bundle exec jekyll build
```

The static site will be generated in the `_site/` directory (where all the cool kids hang out).

> **Deployment wisdom**: Remember, it's not "auto-deploy" if you have to pray it works. Thankfully, Netlify's got your back. 🙏

## 🤝 Contributing (Join the Party!)

This is a personal website, but if you notice any issues or have suggestions (we love helpful humans!):

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

> **Open source etiquette**: PRs welcome, but please no "fixed a typo" commits at 3 AM. We've all been there, but let's batch those up. ☕

## 📄 License (The Legal Mumbo Jumbo)

MIT License - see [LICENSE.txt](LICENSE.txt) for details. _TL;DR: Do good things, don't be evil._ 😇

---

Built with ❤️ by [Adrián Mato](https://adrianmato.com)
