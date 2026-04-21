# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal GitHub Pages site built with [Astro](https://astro.build) - a modern static site generator.

## Commands

| Command | Action |
| :------ | :------ |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

## Architecture

- **Framework**: Astro 6.x (TypeScript)
- **Output**: Static site deployed to GitHub Pages
- **Content**: Astro Content Collections (Markdown/MDX)

## Project Structure

```
src/
├── content/                    # Content Collections
│   ├── blog/                   # Blog posts
│   │   ├── _template.md        # Blog template
│   │   └── *.md                # Blog post files
│   ├── projects/               # Project showcase
│   │   ├── _template.md        # Project template
│   │   └── *.md                # Project files
│   └── README.md               # Content guidelines
├── layouts/
│   ├── Layout.astro            # Main layout + navigation
│   └── PostLayout.astro        # Blog post layout
├── pages/
│   ├── index.astro             # Home page
│   ├── about.astro             # About page
│   ├── projects.astro          # Projects showcase
│   └── blog/
│       ├── index.astro         # Blog list
│       └── [id].astro          # Individual post
└── content.config.ts           # Content Collections config
```

## Adding Content

### Blog Posts

Create Markdown files in `src/content/blog/` with frontmatter:

```markdown
---
title: "Post Title"
description: "Post description"
pubDate: 2026-04-21
draft: false
tags: ["tag1", "tag2"]
---
```

### Projects

Create Markdown files in `src/content/projects/` with frontmatter:

```markdown
---
title: "Project Name"
description: "Project description"
tech: ["React", "TypeScript"]
github: "https://github.com/Rito-492/repo"
draft: false
---
```

## Deployment

- Automated via GitHub Actions on push to `main` branch
- Workflow: `.github/workflows/deploy.yml`

## Theme

- Light theme with blue accent color (`#2563eb`)
- Cards with subtle shadows and hover animations
- Responsive design for mobile
