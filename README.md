# Rito-492.github.io - 个人网站开发指南

个人网站 - 基于 Astro 构建的静态网站

## 📖 目录

1. [快速开始](#-快速开始)
2. [项目结构详解](#-项目结构详解)
3. [修改网站内容](#-修改网站内容)
4. [前端开发基础](#-前端开发基础)
5. [常见问题](#-常见问题)

---

## 🚀 快速开始

### 环境要求

- Node.js 18+ (推荐 20+)
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动本地开发服务器，访问 **http://localhost:4321**

> 💡 开发模式下，修改代码后页面会自动刷新

### 构建生产版本

```bash
npm run build
```

构建到 `./dist/` 目录

### 本地预览

```bash
npm run preview
```

---

## 📁 项目结构详解

```
src/
├── content/                    # 内容集合 (Markdown 文件)
│   ├── blog/                   # 博客文章
│   │   ├── _template.md        # 博客模板
│   │   └── *.md                # 具体文章
│   └── projects/               # 项目作品
│       ├── _template.md        # 项目模板
│       └── *.md                # 具体项目
│
├── layouts/                    # 布局组件
│   └── Layout.astro            # 主布局 (导航栏 + 页脚 + 页面框架)
│
├── pages/                      # 页面路由
│   ├── index.astro             # 首页
│   ├── about.astro             # 关于页面
│   ├── projects.astro          # 项目列表页
│   ├── 404.astro               # 自定义 404 页面
│   └── blog/
│       ├── index.astro         # 博客列表页
│       └── [id].astro          # 文章详情页
│
├── components/                 # 可复用组件
│   ├── Header.astro            # 导航栏
│   ├── Footer.astro            # 页脚
│   ├── BlogCard.astro          # 博客卡片
│   └── ProjectCard.astro       # 项目卡片
│
├── styles/                     # 全局样式
│   ├── variables.css           # CSS 变量 (颜色、字体等)
│   ├── base.css                # 基础样式
│   └── components.css          # 组件样式
│
└── content.config.ts           # 内容集合配置 (Schema 定义)
```

### 关键文件说明

| 文件 | 作用 | 修改内容 |
|------|------|----------|
| `src/layouts/Layout.astro` | 整体页面布局 | 首页侧边栏、右侧目录结构、页面框架 |
| `src/components/Header.astro` | 导航栏 | 导航菜单、Logo、下拉菜单 |
| `src/components/Footer.astro` | 页脚 | 版权信息 |
| `src/pages/index.astro` | 首页 | 博客列表、项目列表的展示 |
| `src/content.config.ts` | 内容配置 | 博客/项目的字段定义 |

---

## ✏️ 修改网站内容

### 1. 修改个人信息（首页侧边栏）

**文件**: `src/layouts/Layout.astro` — 搜索 `profile-card` 定位

```astro
<div class="profile-card">
    <div class="avatar">
        <img src="/avatar.jpg" alt="avatar" />  <!-- 头像图片 -->
    </div>
    <h2 class="name">Rito-492</h2>              <!-- 名字 -->
    <p class="bio">世界很大，开心第一。</p>       <!-- 个人简介 -->
    <div class="social-links">
        <a href="https://github.com/Rito-492" class="social-link">GitHub</a>
        <a href="mailto:your-email@gmail.com" class="social-link">Email</a>
    </div>
</div>
```

**修改头像**:
- 将新头像图片命名为 `avatar.jpg`
- 放到 `public/` 目录下
- 刷新页面即可

---

### 2. 修改导航栏

**文件**: `src/components/Header.astro` — 搜索 `nav-links` 定位

```astro
<nav>
    <a href="/" class="logo">{title}</a>        <!-- Logo 文字 -->
    <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>       <!-- 导航链接 -->
        <li><a href="/projects">Projects</a></li>
        <li><a href="/about">About</a></li>
    </ul>
</nav>
```

**添加新导航项**:
```astro
<li><a href="/新页面">新菜单文字</a></li>
```

---

### 3. 发布博客文章

**文件位置**: `src/content/blog/` 目录下创建 `.md` 文件

**文件命名**: 建议使用英文或数字，如 `my-first-post.md`

**文章模板** (`_template.md`):

```markdown
---
title: "文章标题"
description: "文章描述，显示在列表页"
abstract: "文章摘要，显示在文章标题下方"
pubDate: 202604271200  # 发布时间：YYYYMMDDHHmm
lastUpdated: 202604271830  # 最后编辑时间（可选）
series: "学习笔记"  # 系列名称（可选）
draft: false  # true=草稿（不显示），false=发布
tags: ["标签1", "标签2"]  # 必填，至少一个
---

## 章节标题

正文内容...
```

**字段说明**:

| 字段 | 必填 | 说明 | 显示位置 |
|------|------|------|----------|
| `title` | ✅ | 文章标题 | 文章顶部、列表页 |
| `description` | ✅ | 文章描述 | 列表页卡片 |
| `abstract` | ✅ | 文章摘要 | 文章标题下方 |
| `pubDate` | ✅ | 发布时间 (YYYYMMDDHHmm) | 文章元信息 |
| `lastUpdated` | ❌ | 最后编辑时间 | 文章元信息 |
| `series` | ❌ | 系列名称 | 右侧栏顶部 |
| `tags` | ✅ | 文章标签 | 右侧栏、列表页筛选 |
| `draft` | ❌ | 是否草稿 | - |

**写作技巧**:
- 使用 `## 标题` 和 `### 标题` 创建章节（会自动生成右侧目录）
- 支持 Markdown 语法：列表、代码块、引用等

---

### 4. 添加项目作品

**文件位置**: `src/content/projects/` 目录下创建 `.md` 文件

**项目模板**:

```markdown
---
title: "项目名称"
description: "项目简介"
tech: ["React", "TypeScript"]  # 技术栈
github: "https://github.com/你的用户名/仓库"  # GitHub 链接（可选）
link: "https://项目网址"  # 在线演示链接（可选）
draft: false
---

## 项目详情

详细介绍项目的功能、技术选型等...
```

**字段说明**:

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 项目名称 |
| `description` | ✅ | 项目简介 |
| `tech` | ✅ | 技术栈数组 |
| `github` | ❌ | GitHub 仓库链接 |
| `link` | ❌ | 在线演示链接 |
| `draft` | ❌ | 是否隐藏 |

---

### 5. 修改关于页面

**文件**: `src/pages/about.astro`

直接编辑文件内容，修改自我介绍文字。

---

### 6. 修改颜色主题

**文件**: `src/styles/variables.css`

```css
:root {
    --color-primary: #0891b2;        /* 主色调 */
    --color-primary-hover: #0e7490;  /* 悬停颜色 */
    --color-text: #1e293b;           /* 正文颜色 */
    --color-text-muted: #64748b;     /* 次要文字颜色 */
    --color-border: #e0ded6;         /* 边框颜色 */
    --color-card: #ffffff;           /* 卡片背景 */
    --color-bg: #F8F8F6;             /* 页面背景 */
}
```

修改颜色值后，全站会自动应用新主题色。

---

### 7. 添加社交链接（左侧栏）

**文件**: `src/layouts/Layout.astro` — 搜索 `social-links` 定位

在 `<div class="social-links">` 内添加新链接：

```astro
<div class="social-links">
    <!-- 现有链接 -->
    <a href="mailto:your-email@gmail.com" class="social-link">
        <svg>...</svg>
        Email
    </a>
    
    <!-- 添加新链接 -->
    <a href="你的链接 URL" class="social-link">
        <!-- SVG 图标代码 -->
        显示文字
    </a>
</div>
```

#### 完整示例：添加 Twitter/X 链接

```astro
<a href="https://twitter.com/你的用户名" target="_blank" rel="noopener noreferrer" class="social-link">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
    Twitter
</a>
```

#### 属性说明

| 属性 | 说明 | 是否必须 |
|------|------|----------|
| `href` | 链接地址 | ✅ 必填 |
| `target="_blank"` | 新窗口打开 | 推荐（外链时） |
| `rel="noopener noreferrer"` | 安全属性 | 推荐（配合 `_blank` 使用） |
| `class="social-link"` | 样式类名 | ✅ 必填 |

#### 常用社交平台 SVG 图标

**GitHub**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
</svg>
```

**Steam**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.979 0C5.666 0 .538 5.144.538 11.474c0 1.982.507 3.903 1.477 5.613l1.015 1.856 4.256-3.092c1.438.66 3.032 1.033 4.713 1.033 6.313 0 11.442-5.145 11.442-11.475S18.292 0 11.979 0zm0 20.803c-1.315 0-2.59-.293-3.748-.836l-.356-.168-2.877 2.089-.68-1.255c-.803-1.413-1.228-3.019-1.228-4.659 0-5.151 4.188-9.34 9.34-9.34s9.34 4.189 9.34 9.34c0 5.151-4.189 9.34-9.34 9.34z"/>
    <path d="M11.979 6.39c-2.776 0-5.036 2.259-5.036 5.035s2.26 5.035 5.036 5.035 5.035-2.259 5.035-5.035-2.26-5.035-5.035-5.035zm0 8.062c-1.67 0-3.027-1.358-3.027-3.027 0-1.67 1.357-3.027 3.027-3.027 1.669 0 3.027 1.358 3.027 3.027 0 1.67-1.36 3.027-3.027 3.027z"/>
</svg>
```

**Twitter/X**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
</svg>
```

**Bilibili**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.295 8.461c.752-.236 1.299-.368 1.641-.398.69-.061 1.592-.005 1.592 1.962 0 1.856-.855 1.982-1.898 1.982-.608 0-1.115-.156-1.561-.343l-.855 1.441c.561.266 1.22.464 1.952.464 1.909 0 3.496-.772 3.496-3.543 0-1.551-.608-2.675-2.302-3.214l-2.065-.353zm-7.54 2.797c-.732 0-1.33-.597-1.33-1.329s.598-1.329 1.33-1.329 1.329.597 1.329 1.329-.597 1.329-1.329 1.329zm-4.474 0c-.732 0-1.329-.597-1.329-1.329s.597-1.329 1.329-1.329 1.33.597 1.33 1.329-.598 1.329-1.33 1.329zm12.03-3.338c-.126-.021-.251-.041-.377-.061V3.584c0-1.952-1.483-2.817-3.224-2.817H8.29C6.285.767 4.66 1.76 4.66 3.885v4.093c-.166.031-.332.062-.498.093C1.77 8.492 0 10.178 0 12.908c0 3.692 2.914 5.934 6.606 5.934 2.066 0 3.818-.773 5.018-1.993 1.19 1.13 2.942 1.833 4.947 1.833 3.692 0 6.606-2.162 6.606-5.854 0-2.619-1.671-4.388-3.862-5.006zm-3.17 8.787c-1.631 0-2.851-.752-3.48-1.661v2.589H9.18v-4.484h2.014c.629-.021 1.157.207 1.157.896v.353c.514-1.064 1.713-1.713 3.195-1.713 2.193 0 3.592 1.413 3.592 3.573 0 2.354-1.579 3.847-3.958 3.847z"/>
</svg>
```

**知乎**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.846 0c-.692 0-1.322.37-1.636.96l-4.396 8.186a.246.246 0 0 0 .218.361h3.169v2.033c0 3.605 2.34 6.753 5.738 7.796a.25.25 0 0 0 .32-.166l.865-2.852a.25.25 0 0 0-.152-.304c-1.244-.438-2.148-1.59-2.148-2.944v-3.563h3.476a.25.25 0 0 0 .218-.361L15.482.96a1.852 1.852 0 0 0-1.636-.96z"/>
</svg>
```

#### 如何获取其他 SVG 图标

1. 访问 [Simple Icons](https://simpleicons.org/) 或 [IconPark](https://iconpark.oceanengine.com/)
2. 搜索品牌名称（如 "Discord", "Telegram"）
3. 点击图标，复制 SVG 代码
4. 粘贴到 `<svg>` 标签内，替换 `<path>` 部分

---

## 🎨 前端开发基础

### Astro 基础概念

**什么是 Astro？**
- 一个现代静态网站生成器
- 支持 Markdown、组件化开发
- 构建时生成纯 HTML，无需服务器

**`.astro` 文件结构**:

```astro
---
// Frontmatter 区域（两个 --- 之间）
// 这里是 JavaScript/TypeScript 代码
import Component from '../components/Component.astro';
const title = "页面标题";
---

<!-- 模板区域 -->
<html>
    <body>
        <h1>{title}</h1>  <!-- 使用花括号输出变量 -->
        <Component />     <!-- 使用组件 -->
    </body>
</html>

<style>
    /* CSS 样式 */
    h1 { color: red; }
</style>
```

### 常用修改场景

#### 修改文字内容
直接找到对应文件，修改引号内的文字即可。

#### 修改链接
找到 `<a href="旧链接">`，替换 `href` 属性值。

#### 添加新页面
1. 在 `src/pages/` 目录创建 `新页面名.astro`
2. 复制现有页面的结构
3. 在导航栏添加链接

#### 修改样式
- 小改动：直接在组件的 `<style>` 标签内修改
- 全局改动：修改 `src/styles/variables.css`

---

## ❓ 常见问题

### Q1: 修改后没有生效？
1. 确保开发服务器在运行 (`npm run dev`)
2. 硬刷新浏览器：`Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
3. 清除浏览器缓存

### Q2: 如何部署到 GitHub Pages？
网站已配置自动部署：
1. 推送代码到 `main` 分支
2. GitHub Actions 会自动构建并部署
3. 访问 `https://你的用户名.github.io/仓库名`

### Q3: 博客文章不显示？
检查 `draft` 字段是否为 `false`：
```markdown
draft: false  <!-- 必须是 false 才会显示 -->
```

### Q4: 如何添加新的配色方案？
在 `src/styles/variables.css` 中添加：
```css
[data-theme="dark"] {
    --color-primary: #0891b2;
    --color-bg: #1a1a1a;
    /* ... */
}
```

### Q5: 如何修改字体？
在 `src/layouts/Layout.astro` 的 `<head>` 部分添加 Google Fonts 链接：
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC&display=swap" rel="stylesheet" />
```

然后在 CSS 中使用：
```css
body {
    font-family: 'Noto Serif SC', serif;
}
```

---

## 📚 学习资源

- [Astro 官方文档](https://docs.astro.build/zh-cn/)
- [Markdown 语法指南](https://commonmark.org/help/)
- [CSS 教程](https://developer.mozilla.org/zh-CN/docs/Web/CSS)

---

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build) 6.x
- **语言**: TypeScript
- **样式**: CSS (CSS Variables)
- **部署**: GitHub Pages + GitHub Actions

---

最后更新：2026-05-06
