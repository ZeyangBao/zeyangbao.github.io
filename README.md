# Zeyang Bao - Personal Website

A personal academic website built with a Markdown-based content management system. Write posts in Markdown and manage content through YAML files for easy updates without touching HTML.

## 🚀 Quick Start

### Building the Site

```bash
# Install dependencies (only needed once)
npm install

# Build all pages from Markdown and YAML files
npm run build
```

This generates:
- `index.html` from `content/homepage.yml`
- `writing.html` and `posts/*.html` from `content/posts/*.md`
- (Experience page coming soon)

## 📝 Adding New Blog Posts

1. Create a new Markdown file in `content/posts/`:

```markdown
---
title: "Your Post Title"
date: "December 2024"
readTime: "10 min read"
excerpt: "A brief description of your post that appears in listings"
tags: ["Tag1", "Tag2", "Tag3"]
---

# Your Content Here

Write your post content using Markdown...
```

2. Build the site:

```bash
npm run build
```

3. Your new post will appear in `writing.html` and have its own page in `posts/your-post-title.html`

## 🏠 Updating Homepage Content

Edit `content/homepage.yml` to update:
- Bio and social links
- Research interests
- Featured work
- News updates

Then run `npm run build` to regenerate `index.html`.

## 📁 Project Structure

```
.
├── content/               # Content source files
│   ├── posts/            # Blog posts (Markdown)
│   │   ├── building-notebooklm.md
│   │   └── understanding-rag.md
│   └── homepage.yml      # Homepage content data
├── posts/                # Generated blog post HTML
├── images/               # Image assets
├── index.html            # Generated homepage
├── writing.html          # Generated blog listing
├── experience.html       # Experience page
├── stylesheet.css        # Styles
├── build.js              # Build script
└── package.json          # Dependencies
```

## 🛠️ Technology Stack

- **Content**: Markdown files with YAML frontmatter
- **Build System**: Node.js with markdown-it, gray-matter, and js-yaml
- **Styling**: Vanilla CSS
- **Hosting**: GitHub Pages

## 📄 Original Template

Based on Jon Barron's academic website template.