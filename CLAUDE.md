# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal GitHub Pages site built with [Astro](https://astro.build) 6.x — a modern static site generator. Content is written in Markdown with frontmatter, styled with scoped CSS using CSS custom properties.

## Commands

| Command | Action |
| :------ | :------ |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

## Architecture

- **Framework**: Astro 6.x (TypeScript)
- **Output**: Static site deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **Content**: Astro Content Collections with `glob` loader
- **Styling**: Scoped CSS in `.astro` files + global stylesheets with CSS custom properties
- **Fonts**: JetBrains Mono (code) + LXGW WenKai (body)

## Project Structure

```
src/
├── content.config.ts           # Content collection schemas
├── content/
│   ├── blog/                   # Blog posts (Markdown)
│   │   ├── _template.md        # Frontmatter template
│   │   └── *.md                # Actual posts
│   ├── projects/               # Project showcase (Markdown)
│   │   ├── _template.md        # Frontmatter template
│   │   └── *.md                # Actual projects
│   └── README.md               # Content authoring guidelines
├── layouts/
│   ├── Layout.astro            # Main layout: header, footer, SEO, font loading, responsive grids
│   │                           # Also handles: home page sidebar, blog post TOC sidebar
│   └── PostLayout.astro        # Minimal wrapper (legacy, mostly superseded by Layout.astro)
├── pages/
│   ├── index.astro             # Home page — hero + latest 3 posts
│   ├── about.astro             # About page — avatar, intro, toolbox, social links
│   ├── projects.astro          # Project showcase grid
│   ├── 404.astro               # Custom 404 page
│   └── blog/
│       ├── index.astro         # Blog list — timeline grouped by month, sidebar filters
│       └── [id].astro          # Blog post — renders markdown, builds TOC from h2/h3
├── components/
│   ├── Header.astro            # Sticky nav bar with mobile hamburger menu
│   ├── Footer.astro            # Site footer
│   ├── BlogCard.astro          # Blog post card (used on home page)
│   └── ProjectCard.astro       # Project card
└── styles/
    ├── variables.css           # CSS custom properties (colors, fonts, spacing, radius, transitions)
    ├── base.css                # Reset + base element styles
    └── components.css          # Reusable component styles (buttons, cards, etc.)
```

## Key Design Decisions

### Layout system
- **Home page**: 3-column grid — `1fr 720px 1fr`. Left sidebar (profile card), center content, empty right column.
- **Blog post**: 3-column grid — `1fr 680px 1fr`. Center article, right TOC sidebar with `border-left`.
- **Blog list**: 3-column grid — `25% 50% 25%`. Center timeline, right sidebar with series/tag filters.
- **Other pages** (about, projects): single column with `max-width: 900px` via `.full-width` class.

### Blog list sidebar vs Blog post sidebar
Both sidebars share the same visual language:
- `border-left: 1px solid var(--color-border)`
- Section titles: `1rem / font-weight: 600 / color: var(--color-primary)` with icon
- Items: `0.85rem / color: var(--color-text-muted)` with `border-left: 2px solid transparent` → `var(--color-primary)` on hover/active
- Tags: plain text (no border/background), `0.78rem`, `padding-left: 0.5rem`

### Blog list timeline
Posts are grouped by month (parsed from `pubDate` format `YYYYMMDDHHmm`). A vertical timeline line runs down the left with month labels as nodes. Each post card connects to the timeline via a dot + line pseudo-element.

## Content Schema

### Blog (`src/content/blog/*.md`)

```markdown
---
title: "Post Title"
description: "Short description shown on list pages"
abstract: "One-line summary shown below post title"
pubDate: "202604271200"        # YYYYMMDDHHmm
lastUpdated: "202604301200"    # Optional
draft: false
series: "系列名"                # Optional — groups posts into a series
tags: ["tag1", "tag2"]         # Required — at least one
---
```

### Projects (`src/content/projects/*.md`)

```markdown
---
title: "Project Name"
description: "Short description"
tech: ["React", "TypeScript"]
github: "https://github.com/Rito-492/repo"  # Optional
link: "https://demo.url"                    # Optional
draft: false
---
```

## Theme

CSS custom properties defined in `src/styles/variables.css`:

| Variable | Value | Usage |
| :------- | :---- | :---- |
| `--color-primary` | `#0891b2` | Links, accents, active states |
| `--color-primary-hover` | `#0e7490` | Hover states |
| `--color-bg` | `#F8F8F6` | Page background |
| `--color-card` | `#ffffff` | Card backgrounds |
| `--color-text` | `#1e293b` | Body text |
| `--color-text-muted` | `#64748b` | Secondary text |
| `--color-border` | `#e0ded6` | Borders, dividers |
| `--font-mono` | `'JetBrains Mono', monospace` | Code |
| `--font-sans` | `'LXGW WenKai', ...` | Body text |

## CSS Gotchas

- All `.astro` files use **tab indentation** in `<style>` blocks. Match existing indentation exactly.
- Scoped styles in Astro add a `data-astro-cid-*` attribute. Use `:global()` to style content rendered from markdown.
- `base.css` applies `max-width: 1200px; padding: 2rem` to `main` — pages with custom layouts override this with `!important` or use `.full-width`.
