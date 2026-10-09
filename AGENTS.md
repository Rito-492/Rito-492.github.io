# AGENTS.md

Astro 6 静态站点（个人博客，部署到 GitHub Pages；单包仓库，非 monorepo）。内容 = Markdown 集合；样式 = 组件内 scoped CSS + CSS 自定义属性。网页设计开源，博客文章存放在私有 Obsidian vault 仓库的 `blog/` 子目录，构建时拉取。

## 命令

| Command           | Action                                   |
| :---------------- | :--------------------------------------- |
| `npm run dev`     | 开发服务器（`--host`，`localhost:4321`） |
| `npm run build`   | 构建生产站点到 `./dist/`                 |
| `npm run preview` | 本地预览生产构建                         |
| `npm run format`  | Prettier 格式化全部代码                  |

- **格式化用 Prettier**（`.prettierrc.json`：tab 缩进 / 单引号 / `embeddedLanguageFormatting: off`，配合 `.editorconfig`）；**无 typecheck / lint / test 工具**。验证手段是 `npm run build` + `npm run format` 后 `prettier --check .` 干净。Node 要求 `>=22.12`（engines 字段；CI 用 22）。

## 架构

- **框架**：Astro 6.x（TypeScript）
- **输出**：静态站点，GitHub Actions 部署到 GitHub Pages（`.github/workflows/deploy.yml`）
- **内容**：Astro Content Collections，`glob` loader
- **样式**：`.astro` 内 scoped CSS + 全局样式表（CSS 自定义属性）
- **字体**：JetBrains Mono（代码）+ LXGW WenKai（正文）
- **博客内容与网页代码解耦**：网页代码开源（本仓库），博客文章在私有 vault 仓库，构建时拉取（见下节）

**性能预算**：单页 HTML+CSS+JS+图片 ≈ 60KB（字体除外，字体见「待办」）。Giscus 评论 iframe 滚入视口才加载；字体只请求实际用到的字重（JetBrains Mono 400/700）；新资源尽量保持这个量级。

## 博客内容解耦（网页开源 / 内容私有）

博客写作和网页代码分离：网页代码开源（本仓库），博客文章存放在私有仓库（Obsidian 库，位于 Windows 主机）的 `blog/` 子目录。网站仓库运行在 WSL 中。

### 方案：CI 构建时拉取（已选定）

开源仓库不含任何内容数据；构建时从私有 vault 仓库拉取 `20_blog/`。**本地接入形态：sparse clone（模拟 CI 的取数方式）**——预览前用 git 把最新内容拉下来，不用软链接、不跨文件系统。

```
garden (私有 vault = Obsidian 库，Windows 主机，平时在这里写作；WSL 中 sparse clone 于 ~/workspace/40_garden）
├── 00_seeds/ 01_template/ 10_diary/ .obsidian/ ...
│                                          # 其余内容私有，永远不进站点/CI
└── 20_blog/                               # 博客文章（唯一进入站点的内容）
    └── *.md                               # 2026_04_29_preface / 2026_05_06_how_i_build_my_blog / Untitled(草稿)

Rito-492.github.io/                        # 网站仓库（WSL）
└── src/content/blog -> ~/workspace/40_garden/20_blog   # 软链接（ext4→ext4，可靠）；文章路径即 src/content/blog/*.md
```

> vault 的博客目录是 `20_blog/`（PARA 数字花园命名），不是 `blog/`；博客模板在 `01_template/20_blog.md`（Templater），不进站点。

> 不选 git submodule：submodule 不能挂载仓库子目录（只能挂整个仓库根），与 vault 结构冲突；且版本锁定对个人博客价值低。
> 不选跨 `/mnt/c` 的软链接：路径写死 Windows 用户目录，dev server 跨挂载监听不可靠。最终方案是本地 ext4 软链接（`src/content/blog` → `~/workspace/40_garden/20_blog`），无此问题；因此 `.gitignore` 的忽略规则写成 `src/content/blog`（**无尾斜杠**，才能盖住软链接本身）。

### 本地开发

```bash
# 一次性准备（garden 稀疏检出到 ~/workspace/40_garden，只检出 20_blog/；再软链接进站点）
git clone --sparse git@github.com:Rito-492/garden.git ~/workspace/40_garden
git -C ~/workspace/40_garden sparse-checkout set 20_blog
ln -s ~/workspace/40_garden/20_blog src/content/blog

# 预览前同步内容（模拟 CI 取数）
git -C ~/workspace/40_garden pull

# 写作在 Windows 的 Obsidian（vault）里进行，提交推送也在 vault 里。
# 只有改网页代码才 push 本仓库
```

### CI 构建

`.github/workflows/deploy.yml` build job 的步骤（内容先拉到 `_garden` 再搬进 `src/content/blog`，与本地软链接的最终结构一致）：

```yaml
steps:
    - name: Checkout site
      uses: actions/checkout@v4

    - name: Checkout blog content (private vault)
      uses: actions/checkout@v4
      with:
          repository: Rito-492/garden
          path: _garden
          sparse-checkout: 20_blog # 只拉 20_blog/，vault 其余内容不进 CI
          token: ${{ secrets.BLOG_REPO_TOKEN }}

    - name: Move content into place
      run: mv _garden/20_blog src/content/blog

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
          node-version: '22'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
```

### GitHub 配置

创建 fine-grained PAT：Repository access **只选**私有 vault 仓库，Permissions → Contents → **Read-only**；添加到本仓库 `Settings > Secrets and variables > Actions`，命名为 `BLOG_REPO_TOKEN`。

### 迁移步骤（一次性）

- [x] 0. 搬运文章不需要：garden 的 `20_blog/` 已含全部文章且更新（2026-05 核对）；WSL 旧拷贝已备份至 `/tmp/opencode/blog-backup-20261009`
- [x] 1. WSL 接入：`~/workspace/40_garden` sparse clone + `src/content/blog` 软链接
- [x] 2. `deploy.yml`：内容 checkout + 搬运步骤、`schedule` 每 2 小时重建（定时 + 手动，已选定）
- [x] 3. `blog/[id].astro` 草稿过滤（`isPublished`），build 验证通过
- [x] 4. `.gitignore` 规则改为 `src/content/blog`（无尾斜杠，盖住软链接）
- [x] 5. **用户操作**：创建 fine-grained PAT（只勾 garden、Contents 只读）→ 配 `BLOG_REPO_TOKEN` secret（2026-10-09 完成）
- [x] 6. `git push`（2026-10-09 完成，workflow 运行成功，线上已有文章）

> 状态（2026-10-09）：**迁移完成**。workflow 成功、线上站点已带文章、草稿不进产物。

### 文件变更清单

- `.github/workflows/deploy.yml` — 内容 checkout + 搬运步骤；`schedule` 每 2 小时重建
- `.gitignore` — `src/content/blog/` → `src/content/blog`（盖住软链接）
- `src/pages/blog/[id].astro` — `getStaticPaths` 过滤 `isPublished`
- `src/content/blog` — 本地为软链接 → `~/workspace/40_garden/20_blog`（不入库）
- `src/content.config.ts` — **无需改动**（base 仍为 `./src/content/blog`）

### 已知遗留

- 公开仓库历史已于 2026-10-09 两次 `git filter-repo` 清理：`node_modules/`、`.astro/`、`.claude/`、`CLAUDE.md`（第一次）+ 博客文章旧稿 `src/content/blog/`（第二次）。公开历史中已无任何博客内容。
- GitHub 服务端的悬空对象（旧 SHA 短期内仍可直达）需按官方流程联系 support 清除缓存才会彻底消失，或等待 GitHub 自动 GC。
- 注意：`src/content/blog/`、`node_modules/`、`.astro/`、`.claude/`、`CLAUDE.md` 不要再提交进仓库（`.gitignore` 已有规则）。

## 项目结构

```
src/
├── config.ts                   # 站点级配置：SITE（标题/简介/头像）/ SOCIALS / GISCUS，改配置只动这里
├── content.config.ts           # Content collection schemas（日期在此层转成 Date）
├── lib/
│   └── date.ts                 # parseDate / formatDate —— schema 与页面共用
├── content/
│   ├── blog/                   # 软链接 → ~/workspace/40_garden/20_blog（仅本地；CI 构建时拉取/搬运）
│   │   └── *.md                # 实际文章（来自 vault 的 20_blog/）
│   ├── projects/               # Project showcase (Markdown，保留在本仓库)
│   │   ├── _template.md        # Frontmatter template
│   │   └── *.md                # Actual projects
│   └── README.md               # Content authoring guidelines（字段说明与 schema 同步）
├── layouts/
│   └── Layout.astro            # 组装层：按页面形态分发到下述组件 + 全局交互脚本（滚动进度/返回顶部/点击特效/TOC高亮）
├── pages/
│   ├── index.astro             # Home page — hero + latest 3 posts
│   ├── about.astro             # About page — avatar, intro, toolbox, social links
│   ├── projects.astro          # Project showcase grid
│   ├── 404.astro               # Custom 404 page
│   ├── rss.xml.ts              # RSS feed（只含 isPublished: true）
│   └── blog/
│       ├── index.astro         # Blog list — timeline grouped by month, sidebar filters
│       └── [id].astro          # Blog post — render(post).headings 出 TOC，JSON-LD
├── components/
│   ├── Header.astro            # Sticky nav bar with mobile hamburger menu
│   ├── Footer.astro            # Site footer
│   ├── SeoHead.astro           # <head> 全部内容：meta/OG/Twitter/字体/RSS/JSON-LD
│   ├── ProfileCard.astro       # 首页左侧个人卡片
│   ├── SocialLinks.astro       # 社交链接（数据来自 config.ts；ids 属性可控制各页顺序）
│   ├── TocSidebar.astro        # 文章页右侧：系列/标签/目录
│   ├── ContentShell.astro      # 内容主栏：滚动进度条 + slot + 返回顶部
│   ├── ThemeToggle.astro       # 三态主题切换（浅色/深色/跟随系统，localStorage 持久化）
│   ├── MobileToc.astro         # 移动端目录浮钮 + 上拉面板（<1150px 替代 TocSidebar）
│   └── GiscusComments.astro    # Giscus comments，滚入视口才加载（省内存）
└── styles/
    ├── variables.css           # CSS 自定义属性（含 prefers-color-scheme 暗色调色板）
    ├── base.css                # Reset + base element styles
    ├── components.css          # Reusable component styles (buttons, cards, etc.)
    └── layouts.css             # 页面结构布局（全局）：home/post 三栏网格、.full-width
```

## 关键设计决策

### Layout system

`Layout.astro` 是纯组装层（2026-10 重构）：`SeoHead`（head）+ `Header` + 四种页面形态分支 + `Footer` + 全局交互脚本。结构布局样式在 `styles/layouts.css`（全局），组件样式跟随各自组件。

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

Posts are grouped by month (parsed from `pubDate` format `YYYY_MM_DD_HH_mm`). A vertical timeline line runs down the left with month labels as nodes. Each post card connects to the timeline via a dot + line pseudo-element.

## 内容 Schema

### Blog (`src/content/blog/*.md`)

```markdown
---
title: 文章标题
description: 用一句话概括文章内容，显示在列表页
abstract: 用一句话概括全文，显示在文章标题下方
pubDate: '2026_04_27_12_00' # YYYY_MM_DD_HH_mm（建议加引号；不加引号 YAML 会解析为数字，schema 层 parseDate() 两种都兼容，页面拿到的已是 Date）
modDate: '2026_04_27_12_00' # Optional — 最后编辑时间（同上）
isPublished: false # 是否发布（替代旧 draft 字段，语义反转）
series: 系列名 # Optional — groups posts into a series
tags: # Required — at least one
    - 标签1
    - 标签2
---
```

### Projects (`src/content/projects/*.md`)

```markdown
---
title: 'Project Name'
description: 'Short description'
tech: ['React', 'TypeScript']
github: 'https://github.com/Rito-492/repo' # Optional
link: 'https://demo.url' # Optional
draft: false
---
```

补充（以 `src/content.config.ts` + 各集合 `_template.md` 为准，`README.md` / `src/content/README.md` 的字段说明已过时）：

- `blog` 集合的 `base` 是 `./src/content/blog`（经软链接解析到 `~/workspace/40_garden/20_blog`，CI 里是搬运后的同名目录）；`projects` 是 `./src/content/projects`。
- `blog` 和 `projects` 都用 `glob('**/*.md')` 加载器。**下划线开头的文件不会被忽略** — `_template.md` 会真实构建出 `/blog/_template` 页面（只是因为其 frontmatter 是 `isPublished: false` 才不出现在列表里）。
- 博客可见性：列表页/首页/`blog/[id].astro` 全部过滤 `isPublished: true`（2026-10-09 起），草稿不进产物。
- 项目用 `draft` — 字段名和博客的 `isPublished` 不一致。
- 额外的 frontmatter 字段（`UID`、`created`、`updated`）会被 schema 忽略；模板里有 Obsidian Templater 占位符（`<% tp... %>`），这是预期的写作流程。

## 主题

CSS 自定义属性定义在 `src/styles/variables.css`：

| Variable                | Value                         | Usage                         |
| :---------------------- | :---------------------------- | :---------------------------- |
| `--color-primary`       | `#0891b2`                     | Links, accents, active states |
| `--color-primary-hover` | `#0e7490`                     | Hover states                  |
| `--color-bg`            | `#F8F8F6`                     | Page background               |
| `--color-card`          | `#ffffff`                     | Card backgrounds              |
| `--color-text`          | `#1e293b`                     | Body text                     |
| `--color-text-muted`    | `#64748b`                     | Secondary text                |
| `--color-border`        | `#e0ded6`                     | Borders, dividers             |
| `--font-mono`           | `'JetBrains Mono', monospace` | Code                          |
| `--font-sans`           | `'LXGW WenKai', ...`          | Body text                     |

暗色模式（2026-10 起）：**三态主题选择器**（Header 右侧按钮循环：跟随系统 → 浅色 → 深色，`localStorage['theme']` 持久化）。CSS 语义：`html[data-theme='dark']` 强制深色、`html[data-theme='light']` 强制浅色、无属性跟随系统（`prefers-color-scheme`，无 JS 也可用）；防闪烁预置脚本在 `SeoHead.astro`。Giscus 评论区通过 `themechange` 事件 + postMessage 联动切换。暗色调色板在 `variables.css`（`--color-primary` 提亮为 `#22a3c7` 保证对比度）。

## 易错点 / CSS Gotchas

- **格式化交给 `npm run format`**，别手调缩进/引号，`prettier --check .` 不干净 CI 体验会差。
- Astro scoped 样式覆盖不到 markdown 渲染出的内容，需要用 `:global()`。
- `base.css` 给 `main` 应用了 `max-width: 1200px; padding: 2rem`；自定义布局的页面要么覆盖它（`!important`），要么用 `.full-width` 类。
- **博客列表页排序依赖 `data-date` 属性的字符串比较**（`localeCompare`）— 必须输出 ISO 字符串这类定长可排序格式，改日期输出时勿破坏。
- `.astro` 的三元/表达式分支里**不能写 HTML 注释**（Astro 编译器容忍但 prettier 的 astro 解析器会崩）；`.css` 文件写纯 CSS，别套 `<style>` 标签。
- Giscus 评论配置（repo/category ID）在 `src/config.ts` 的 `GISCUS`，不在页面里。
- `.astro/` 和 `dist/` 是生成产物 — 永远不要直接编辑。

## 待办 / TODO

- **字体自托管**：当前 JetBrains Mono 走 Google Fonts、霞鹜文楷走 jsdelivr（`SeoHead.astro`）——国内访问不稳。方案：自托管 unicode-range 分片子集（如 `lxgw-wenkai-webfont`）+ `@fontsource/jetbrains-mono`，替换 CDN 引用。
- **文章内图片发布通道**：`20_blog/` 目前无图片所以无感；一旦文章插图（Obsidian `![[img]]` 或相对路径），构建不会带图。方案：vault 侧 `20_blog/assets/` + CI sparse-checkout 一并搬运 + markdown 用相对路径，另需处理本地软链接下的解析。
- **UI 待办（C 组·首页）**：hero 区加行动引导按钮；访客计数（counterapi.dev 第三方依赖）换更稳服务或去掉。
- **UI 待办（D 组·质感）**：`:focus-visible` 键盘焦点样式；View Transitions 页面切换过渡（需回归测试 Giscus/脚本）；正文外链视觉标识（↗）；per-post OG 分享卡（satori 按标题生成）。

## 部署

推送 `main` → `.github/workflows/deploy.yml` → 构建（`npm ci` + `npm run build`）→ GitHub Pages。构建前从私有 vault 仓库拉取 `20_blog/`（sparse-checkout + 搬运，需 `BLOG_REPO_TOKEN`）。

⚠️ **推送 vault（发新文章）不会触发部署** — `deploy.yml` 只监听网站仓库的 push。已选**定时 + 手动**：`schedule` 每 2 小时自动重建（公共仓库 Actions 免费，上线延迟最多 2 小时），急用时到 Actions 页对 deploy workflow 点 "Run workflow"（`workflow_dispatch` 已配置）。将来想要即时上线可在 vault 加 push workflow 调本站 `workflow_dispatch`（需第二个 token，Actions: Read and write）。

忽略 `tmp/` 和 `.claude/`（临时/本地目录）。
