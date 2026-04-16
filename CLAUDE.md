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
- **Content**: Blog posts use Astro Content Collections (Markdown/MDX)

## Project Structure

```
src/
├── content/
│   └── blog/          # Blog posts (Markdown)
├── layouts/
│   ├── Layout.astro   # Main layout with navigation
│   └── PostLayout.astro # Blog post layout
├── pages/
│   ├── index.astro    # Home page
│   ├── about.astro    # About page
│   ├── projects.astro # Projects showcase
│   └── blog/
│       ├── index.astro # Blog list
│       └── [id].astro  # Individual post
└── content.config.ts  # Content collections config
```

## Adding Blog Posts

Create new Markdown files in `src/content/blog/` with frontmatter:

```markdown
---
title: "Post Title"
description: "Post description"
pubDate: 2026-04-16
draft: false
tags: ["tag1", "tag2"]
---
```

## Deployment

- Automated via GitHub Actions on push to `main` branch
- Workflow: `.github/workflows/deploy.yml`
