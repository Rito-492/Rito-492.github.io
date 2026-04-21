# Rito-492.github.io

个人网站 - 基于 Astro 构建的静态网站

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

启动本地开发服务器，访问 http://localhost:4321

### 构建

```bash
npm run build
```

构建生产版本到 `./dist/` 目录

### 预览

```bash
npm run preview
```

本地预览生产构建

## 📁 项目结构

```
src/
├── content/
│   └── blog/              # 博客文章 (Markdown)
├── layouts/
│   ├── Layout.astro       # 主布局 (导航 + 页脚)
│   └── PostLayout.astro   # 博客文章布局
├── pages/
│   ├── index.astro        # 首页
│   ├── about.astro        # 关于页面
│   ├── projects.astro     # 项目作品
│   └── blog/
│       ├── index.astro    # 博客列表
│       └── [id].astro     # 文章详情
└── content.config.ts      # 内容集合配置
```

## ✍️ 添加博客文章

在 `src/content/blog/` 目录下创建新的 Markdown 文件：

```markdown
---
title: "文章标题"
description: "文章描述"
pubDate: 2026-04-16
draft: false
tags: ["标签 1", "标签 2"]
---

这里是文章内容...
```

## 🌐 部署

网站通过 GitHub Actions 自动部署到 GitHub Pages。

推送代码到 `main` 分支即可自动部署。

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build) 6.x
- **语言**: TypeScript
- **部署**: GitHub Pages
