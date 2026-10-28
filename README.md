# Rito-492.github.io

个人博客站点，基于 [Astro](https://astro.build) 7.4 构建，部署到 GitHub Pages。

> 工程细节、架构决策、踩坑记录见 **[AGENTS.md](./AGENTS.md)**（开发时的权威参考）。
> 本文档面向「我想改点东西」的场景，只讲怎么改。

---

## 快速开始

```bash
npm install      # 安装依赖（Node >= 22.23.4，推荐 24）
npm run dev      # 开发服务器 http://localhost:4321
npm run build    # 构建到 ./dist
npm run preview  # 预览生产构建
npm run format   # Prettier 格式化
```

**本地预览前先同步文章**（文章在私有仓库）：

```bash
git -C ~/workspace/40_garden pull
```

---

## 项目结构

```
src/
├── config.ts               # ★ 站点配置：标题/简介/头像/社交链接/Giscus/许可/统计
├── content.config.ts       # 内容集合 schema
├── lib/
│   ├── date.ts             # 日期解析与格式化
│   └── remark-obsidian-images.js  # Obsidian 插图写法兼容插件
├── content/
│   ├── blog/               # 软链接 → 私有 vault 的 20_blog/（不入库）
│   ├── projects/           # 项目作品（Markdown，随本站维护）
│   └── README.md           # 内容字段说明（Frontmatter 权威文档）
├── layouts/
│   └── Layout.astro        # 页面组装层：head + 导航 + 统一三栏外壳 + 全局脚本
├── pages/
│   ├── index.astro         # 首页（hero + 最新文章 + 精选项目 + 总浏览）
│   ├── about.astro         # 关于
│   ├── projects.astro      # 项目列表
│   ├── 404.astro           # 404
│   ├── rss.xml.ts          # RSS 全文输出
│   └── blog/
│       ├── index.astro     # 博客列表（时间线 + 系列/标签筛选 + 排序）
│       └── [id].astro      # 文章页（目录 / 灯箱 / 评论 / 许可声明）
├── components/             # 见下表
└── styles/
    ├── variables.css       # ★ 颜色/字体/圆角/过渡/内容宽度
    ├── base.css            # 重置 + 链接/按钮/卡片/区块标题/空状态等通用件
    ├── components.css      # 文章卡/项目卡/点击特效/细滚动条/灯箱
    ├── sidebar.css         # 右侧栏共享原语（目录 + 列表筛选栏）
    └── layouts.css         # 页面级网格：首页 / 文章页 / 单列页
```

### 组件一览

| 组件                   | 作用                                                 |
| ---------------------- | ---------------------------------------------------- |
| `Header.astro`         | 吸顶导航（含移动端汉堡菜单）                         |
| `Footer.astro`         | 页脚（©/Powered + RSS/源码/许可 图标）               |
| `SeoHead.astro`        | `<head>` 全部内容：meta/OG/字体/RSS/JSON-LD/主题预置 |
| `ProfileCard.astro`    | 首页左侧个人卡片                                     |
| `SocialLinks.astro`    | 社交链接（数据来自 `config.ts` 的 `SOCIALS`）        |
| `Icon.astro`           | 全站统一线性图标（lucide 内联路径）                  |
| `TocSidebar.astro`     | 文章页右栏：系列 / 标签 / 目录                       |
| `MobileToc.astro`      | 移动端目录浮钮 + 上拉面板（<1150px 替代 TocSidebar） |
| `ContentShell.astro`   | 内容主栏容器：滚动进度条 + 返回顶部                  |
| `ThemeToggle.astro`    | 三态主题切换（跟随系统 / 浅色 / 深色）               |
| `GiscusComments.astro` | 评论区（滚入视口才加载）                             |

---

## 常见修改

### 站点信息 / 社交链接 / 评论 / 许可

只改 **`src/config.ts`**：`SITE`（标题、简介、头像、仓库）、`SOCIALS`（社交链接数组）、
`GISCUS`、`LICENSE`、`GOATCOUNTER`。

改头像：替换 `public/avatar.jpg`。

### 配色 / 字体 / 内容宽度

改 **`src/styles/variables.css`**：

- `--color-primary` / `--color-primary-rgb` —— 主色。**两者要一起改**（`-rgb` 是给
  `rgba()` 用的分量，暗色模式会各自覆盖）。
- `--content-width` —— 首页 / 文章页 / 列表页共用的中栏宽度，改一处三页同步。
- 暗色调色板在同一个文件里的两处（`prefers-color-scheme` 与 `[data-theme='dark']`），
  修改时两边要保持一致。

### 导航栏

`src/components/Header.astro` 顶部的 `navItems` 数组，加一项即出现新链接：

```ts
const navItems = [
	{ href: '/', label: 'Home' },
	{ href: '/blog', label: 'Blog' },
	// 新增：{ href: '/新页面', label: '新菜单' },
];
```

### 发布文章

文章在**私有 Obsidian 库**里写，不在本仓库：

1. 在 Obsidian（garden 仓库）的 `20_blog/` 下新建 `.md`
2. Frontmatter 见 [`src/content/README.md`](./src/content/README.md)（字段权威说明）
3. 设为 `isPublished: true`，推送 garden 仓库
4. 站点最多 2 小时后自动重建上线；急用去本仓库 Actions 页点 **Run workflow**

### 添加项目

在 `src/content/projects/` 新建 `.md`，参照 `_template.md`：

```markdown
---
title: '项目名称'
description: '一句话简介'
tech: ['Python', 'PyTorch']
github: 'https://github.com/Rito-492/仓库' # 可选
link: 'https://演示地址' # 可选
draft: false # true = 不显示
---
```

> ⚠️ 项目用 `draft`（true = 隐藏），文章用 `isPublished`（true = 发布），语义相反。

### 新增页面

在 `src/pages/` 建 `.astro` 文件，用 `Layout` 包一层：

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="页面标题">
	<p>内容</p>
</Layout>
```

单列内容页会自动套用 `.full-width`（900px 居中）；需要三栏结构时参考
`src/pages/blog/index.astro`。

---

## 样式约定

改样式前先看这条，能避免大部分「改了没生效 / 越改越乱」：

1. **卡片、按钮、区块标题、空状态等通用件在 `src/styles/` 里，不要在页面里重写。**
   页面 `<style>` 只放该页独有的东西（如 hero、页头）。
2. **卡片悬停语言全站统一**：上浮 2px + 主色描边 + 淡阴影（`components.css` 里定义）。
   加新卡片请复用 `.post-card` / `.project-card` 或沿用同一套 hover 值。
3. **半透明主色一律写 `rgba(var(--color-primary-rgb), α)`**，不要硬编码
   `rgba(8, 145, 178, α)`——否则暗色模式下会偏色。
4. Astro scoped 样式**管不到 Markdown 渲染出的内容**，这类选择器要套 `:global()`。
5. 改完跑 `npm run format`，再 `npm run build` 确认。

---

## 部署

推送 `main` → GitHub Actions 构建 → GitHub Pages。

构建时从私有 vault 仓库拉取 `20_blog/`（sparse-checkout），需要 `BLOG_REPO_TOKEN`。
另有每 2 小时定时重建，用于把 vault 的新文章带上线。CI 用 Node 24（`deploy.yml` 的 `setup-node`），与本地推荐版本一致。

---

## 技术栈

- **框架**：Astro 7.4（静态输出）
- **Markdown**：统一走 `unified` 处理器（remark/rehype 管线，`@astrojs/markdown-remark`），由 `remark-obsidian-images` 处理 Obsidian 插图；未用 Astro 7 默认的 Sätteri 管线
- **HTML 压缩**：`astro.config.mjs` 显式 `compressHTML: true`，沿用 Astro 6 的无损空白压缩（Astro 7 默认 `'jsx'`）
- **样式**：原生 CSS + 自定义属性（无预处理器）
- **字体**：JetBrains Mono + 霞鹜文楷（当前走 CDN，自托管在待办中）
- **评论**：Giscus（GitHub Discussions）
- **统计**：GoatCounter
- **部署**：GitHub Pages + GitHub Actions
