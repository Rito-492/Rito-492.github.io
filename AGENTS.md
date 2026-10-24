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
# 若 SSH 拉取卡住（国内到 GitHub 不稳），改走 HTTPS（本机 credential store 已配置）：
git -C ~/workspace/40_garden pull https://github.com/Rito-492/garden.git main

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
├── config.ts                   # 站点级配置：SITE（标题/简介/头像）/ SOCIALS / GISCUS / LICENSE / GOATCOUNTER，改配置只动这里
├── content.config.ts           # Content collection schemas（日期在此层转成 Date）
├── lib/
│   ├── date.ts                 # parseDate / formatDate —— schema 与页面共用
│   └── remark-obsidian-images.js # Obsidian 插图写法 → Astro 图片管线（构建时转换）
├── content/
│   ├── blog/                   # 软链接 → ~/workspace/40_garden/20_blog（仅本地；CI 构建时拉取/搬运）
│   │   ├── assets/             # 文章插图（按文章子目录组织）
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
│   ├── Footer.astro            # 页脚：© / Powered by / RSS / 网站源码 / CC
│   ├── SeoHead.astro           # <head> 全部内容：meta/OG/Twitter/字体/RSS/JSON-LD + ClientRouter
│   ├── ProfileCard.astro       # 首页左侧个人卡片
│   ├── SocialLinks.astro       # 社交链接（数据来自 config.ts；ids 属性可控制各页顺序）
│   ├── Icon.astro              # 全站统一线性图标（lucide 路径内联）
│   ├── TocSidebar.astro        # 文章页右侧：系列/标签/目录
│   ├── ContentShell.astro      # 内容主栏：滚动进度条 + slot + 返回顶部
│   ├── ThemeToggle.astro       # 三态主题切换（浅色/深色/跟随系统，localStorage 持久化）
│   ├── MobileToc.astro         # 移动端目录浮钮 + 上拉面板（<1150px 替代 TocSidebar）
│   └── GiscusComments.astro    # Giscus comments，滚入视口才加载（省内存）
└── styles/
    ├── variables.css           # CSS 自定义属性（颜色/字体/圆角/过渡/--content-width + 暗色调色板）
    ├── base.css                # Reset + 链接/按钮/卡片/区块标题/空状态等通用件
    ├── components.css          # 文章卡/项目卡/点击特效/细滚动条/灯箱
    ├── sidebar.css             # 右侧栏共享原语：.side-panel / .side-panel-title / .side-panel-item / .tag-pill
    └── layouts.css             # 全站统一三栏外壳 .page-shell（左身份 / 中内容 / 右上下文）
```

## 关键设计决策

### 样式分层（2026-10 精简后）

**唯一真源原则**：通用件只定义一次，页面 `<style>` 只放该页独有样式。曾经踩过的坑是
`index.astro` 把 `components.css` 整份复制了一遍（约 200 行），导致改样式时改的那份不生效。

- `variables.css` — 设计令牌。`--content-width` 是全站中栏宽度，首页/文章页/列表页共用。
- `base.css` — 无类语义的通用件：`a` / `.btn` / `.section-header` / `.view-more` / `.empty-state` / `.float-icon` / `:focus-visible`。
- `components.css` — 具名组件：`.post-card` / `.project-card` / `.tech-tag` / 点击特效 / 细滚动条 / 灯箱。
- `layouts.css` — 全站统一三栏外壳 `.page-shell`（左身份 / 中内容 / 右上下文），断点 1320px；单列媒体查询里要重置 `grid-column`（见「易错点」）。
- `sidebar.css` — 文章页 TOC 与列表页筛选栏共用的侧栏原语（两者视觉语言一致，差异只在内容）；含溢出渐隐与悬停滚动条。

**卡片悬停语言**（全站统一，`components.css` 定义）：上浮 `translateY(-2px)` + 主色描边

- `0 4px 16px rgba(var(--color-primary-rgb), 0.1)` 淡阴影。新增卡片请复用或沿用同一套值。

**半透明主色**：一律 `rgba(var(--color-primary-rgb), α)`，不要硬编码 `rgba(8, 145, 178, α)`
——暗色模式主色提亮为 `#22a3c7`，硬编码会导致暗色下偏色。

### 文案语言约定（2026-10 定）

**结构/导航/工具标签用英文，正文与口吻保持中文。**

- 英文：导航、侧栏分区标题（Series / Tags / Sort / Contents / Tech Stack）、页面标题、按钮（View All / Home / Blog）、筛选与排序项（All / Newest / Oldest / Clear filters）、元信息标签（Updated / Previous / Next）、状态文案（No posts yet.）
- 中文：文章标题与描述、About 正文、系列名与标签值、版权声明、Footer
- `aria-label` 等无障碍标签跟随 `<html lang="zh-CN">`，保持中文
- 理由：英文标签与等宽字体、既有英文导航一致，视觉更紧凑；长文本与个人口吻保留中文，避免整站变成模板感

### Layout system

`Layout.astro` 是纯组装层：`SeoHead`（head）+ `Header` + **全站统一三栏外壳** + `Footer` + 全局交互脚本。结构布局样式在 `styles/layouts.css`（全局），组件样式跟随各自组件。

**所有页面共用同一套 `.page-shell`**（404 除外）：

- 栅格：`minmax(0,1fr) var(--content-width) minmax(0,1fr)` + `column-gap: 2.5rem`
- **左栏** `.page-left` — 身份与联系（`ProfileCard`），宽度 `--rail-width`（240px），桌面端头像与文字共用一条垂直中心线；RSS 入口与社交链接同列同样式（`SocialLinks includeRss`）。**所有页面在桌面端都渲染**；列表 / 项目 / 文章页传 `hideProfileOnMobile`，窄屏下不显示这条紧凑身份条（首页与 About 窄屏仍保留）
- **中栏** `.main-content` — 页面主体，宽度固定 `--content-width`
- **右栏** `.side-panel` — 页面上下文，同样宽 `--rail-width`，由页面通过 `<Fragment slot="right">` 提供：
    - 首页：系列 / 标签入口 → `/blog?series=`、`/blog?tag=`
    - 文章页：`TocSidebar`（系列 / 标签 / 目录）
    - 列表页：系列 / 标签 / 排序筛选
    - About：本页目录（About Me / Toolbox / About This Site）
    - Projects：按技术栈筛选
- 左右栏等宽、无分隔线，靠留白区分；中栏在视觉上保持居中
- 右栏内容溢出时：
    - 竖向：底部渐隐提示，悬停时取消渐隐并显示细滚动条（`is-overflowing`）
    - 横向：单项过长时单行显示 + 右缘渐隐，悬停向左滚到末尾（`scroll-text.is-truncated`；文本本身可横向滑动，触屏也能用）
- **404** 是错误态，保持单列（`ContentShell fullWidth`），不套三栏
- 断点 **1320px**：左栏身份卡变为正文上方的紧凑横条；**右栏整体不渲染**（`layouts.css` 里 `.page-shell > .side-panel { display: none }`）——它原本会掉到正文末尾、夹在页脚前，没有导航价值还拉长页面。替代方案：文章页目录改用 `MobileToc` 浮钮；**列表页筛选**改用正文顶部的 chip 行（`.mobile-filters`，见下节）

> 2026-10 统一前：首页 720 / 文章页 680 / 列表页 700 三套中栏宽度，About/Projects 又是 900px 单列，切页时内容列会横向跳约 100px。现在五类页面中栏位置与宽度完全一致。三栏总宽 `700 + 2×240 + 2×40 = 1260px`，断点取 1320px 留出呼吸空间。

### Blog list sidebar vs Blog post sidebar

Both sidebars share the same visual language，**共用 `styles/sidebar.css` 的原语**：

- `.side-panel` — `border-left: 1px solid var(--color-border)` + sticky + 独立滚动
- `.side-panel-title` — `1rem / font-weight: 600 / color: var(--color-primary)` + 图标
- `.side-panel-item` — `0.85rem / color: var(--color-text-muted)`，`border-left: 2px solid transparent` → 主色（hover/active）
- `.tag-pill` — 纯文字（无边框底色），`0.78rem`

### 列表页窄屏筛选（2026-10）：chip 行

右栏在 `<1320px` 不渲染后，列表页的筛选 / 排序改由正文顶部的 `.mobile-filters` 承担（只在窄屏显示）：

- 第一行：系列 chip（`All` + 各系列，单选），末尾用 `.chip-sep` 分隔后接排序 chip（`Newest` / `Oldest`，点一下切换）
- 第二行：标签 chip（可多选，再点取消）。开启标签筛选时，统计行出现 `Clear`（`.stat-clear`），并隐藏总数，只留 `N posts found`
- 两套控件（桌面右栏 + 窄屏 chip）**共享同一份状态**：`blog/index.astro` 的脚本用模块级 `listState` + `document` 上的单次 click 委托（选择器 `FILTER_CONTROL` 只匹配控件，不误伤 `.post-card` 自带的 `data-series`/`data-tags`），`syncControls()` 同时刷新两处的高亮与文案
- chip 行 `flex-wrap: wrap`（不横向滚动），避免内容被藏在屏幕外

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

补充（以 `src/content.config.ts` + 各集合 `_template.md` 为准，`src/content/README.md` 是面向写作的字段说明）：

- `blog` 集合的 `base` 是 `./src/content/blog`（经软链接解析到 `~/workspace/40_garden/20_blog`，CI 里是搬运后的同名目录）；`projects` 是 `./src/content/projects`。
- `blog` 和 `projects` 都用 `glob('**/*.md')` 加载器。**下划线开头的文件不会被忽略** — `_template.md` 会真实构建出 `/blog/_template` 页面（只是因为其 frontmatter 是 `isPublished: false` 才不出现在列表里）。
- 博客可见性：列表页/首页/`blog/[id].astro` 全部过滤 `isPublished: true`（2026-10-09 起），草稿不进产物。
- 项目用 `draft` — 字段名和博客的 `isPublished` 不一致。
- 额外的 frontmatter 字段（`UID`、`created`、`updated`）会被 schema 忽略；模板里有 Obsidian Templater 占位符（`<% tp... %>`），这是预期的写作流程。
- 文章文件名可用中文（构建/链接/RSS/sitemap 均已实测；URL 分享时是标准 %XX 编码形态）。重命名文件 = 改 URL。

## 主题

CSS 自定义属性定义在 `src/styles/variables.css`：

| Variable                | Value                              | Usage                         |
| :---------------------- | :--------------------------------- | :---------------------------- |
| `--color-primary`       | `#0891b2`                          | Links, accents, active states |
| `--color-primary-rgb`   | `8, 145, 178`                      | 半透明主色底色（`rgba(...)`） |
| `--color-primary-hover` | `#0e7490`                          | Hover states                  |
| `--color-bg`            | `#F8F8F6`                          | Page background               |
| `--color-card`          | `#ffffff`                          | Card backgrounds              |
| `--color-text`          | `#1e293b`                          | Body text                     |
| `--color-text-muted`    | `#64748b`                          | Secondary text                |
| `--color-border`        | `#e0ded6`                          | Borders, dividers             |
| `--font-body`           | `'JetBrains Mono', 'LXGW WenKai'…` | Body text                     |
| `--font-mono`           | `'JetBrains Mono', monospace`      | Code                          |
| `--content-width`       | `700px`                            | 三页共用的中栏宽度            |
| `--rail-width`          | `240px`                            | 左右栏统一宽度                |

暗色模式（2026-10 起）：**三态主题选择器**（Header 导航菜单左侧按钮循环：跟随系统 → 浅色 → 深色，`localStorage['theme']` 持久化）。CSS 语义：`html[data-theme='dark']` 强制深色、`html[data-theme='light']` 强制浅色、无属性跟随系统（`prefers-color-scheme`，无 JS 也可用）；防闪烁预置脚本在 `SeoHead.astro`。Giscus 评论区通过 `themechange` 事件 + postMessage 联动切换。暗色调色板在 `variables.css`（`--color-primary` 提亮为 `#22a3c7` 保证对比度）。

## 版权声明

- 文章采用 **CC BY-NC-SA 4.0**（2026-10 定）。文章页正文与分页之间一行小字声明（[id].astro）；`<head>` 输出机器可读的 `<link rel="license">`（SeoHead ← Layout `licenseUrl` 透传）；JSON-LD `BlogPosting.license` 同带该 URL。
- 协议配置在 `src/config.ts` 的 `LICENSE`（显示名 / 法律文本 URL / 中文 deed URL）——换协议只改这里。
- About 页采用**文章式排版**（非卡片堆叠，与博客正文一致），包含 About Me / Toolbox / About This Site / Copyright / Privacy 五个章节，右栏目录定位。**Copyright** 逐条列出许可条件（署名 / 非商业 / 相同方式共享）、第三方素材归属与删除联系方式；**Privacy** 说明 GoatCounter 聚合统计与 Giscus 评论数据。

## 文章插图

- 图片放 `20_blog/assets/` 内（可平铺、可 `assets/<文章名>/` 子目录，插件按文件名递归查找）；Obsidian 附件设置建议「当前文件夹下子文件夹 → assets」
- `src/lib/remark-obsidian-images.js`（挂在 `astro.config.mjs` 的 `markdown.remarkPlugins`）构建时统一三种写法后交给 Astro 图片管线（sharp 自动优化：压缩/哈希/懒加载/写死宽高防抖动）：
    - `![[图.jpg]]` → 按文件名在内容目录内递归查找（忽略大小写）
    - `![](20_blog/assets/…)` → 去掉 vault 根前缀、换算成相对文章的路径
    - 标准相对路径 `![](assets/…)` → 原样放行
    - `##标题` 锚点 → 改写为 `#标题`
- `![[图.jpg|400]]` 的数字宽度参数暂不支持；找不到图片时构建告警并原样保留文字
- CI 零改动（sparse-checkout 递归含 assets）；本地 dev 实测可用（无需 fs.allow）
- 大图注意：原图进 git 历史（Astro 只优化产物、不减仓库），建议插图前压缩（长边 ~2000px）

## 页面前端（View Transitions / 交互）

- 已启用 **View Transitions**（`<ClientRouter />` 在 SeoHead，默认 crossfade）。页面脚本三原则：
    - 打包脚本全站只执行一次：页面级逻辑一律写成 `function init(){}` + `document.addEventListener('astro:page-load', init)`，带 DOM 存在性守卫、可重复安全执行
    - 文档级监听（scroll/click/keydown）只在模块顶层绑一次；目标元素在回调里**实时查询**，不缓存引用
    - 主题：`<html>` 属性在导航后可能被重置，ThemeToggle 在 `astro:after-swap` 从 localStorage 重放
- **图片灯箱**：点文章图全屏预览（点击任意处 / Esc 关闭；滚动锁在 after-swap 清理）。遮罩由 JS 动态挂到 `<body>`——放页面容器里会被祖先 stacking context 压到顶栏下面；样式在 `components.css`
- **Footer**：© / Powered by Astro · GitHub Pages / RSS 订阅 / 网站源码 / CC 许可；数据都在 `config.ts`
- 图标：全站统一用 `Icon.astro`（lucide 内联路径），不要再用 emoji
- 侧栏细滚动条：`components.css`（`.toc-sidebar` / `.blog-sidebar` / `.mobile-toc-panel`）
- **RSS 全文输出**：`rss.xml.ts` 用 `experimental_AstroContainer` 渲染每篇文章，站内 `src/href` 绝对化后以 **CDATA** 形式放入 `<content:encoded>`（兼容 WordPress 系阅读器习惯）；`description` 仍作摘要兜底
- **正文链接行为**：`#` 锚点保持当前页跳转；其余链接（外链 + 站内文章）在 `initPostContent` 里统一加 `target="_blank" rel="noopener noreferrer"`（JS 增强，无 JS 时降级为同页跳转）
- **统计**：GoatCounter（code 在 `config.ts` 的 `GOATCOUNTER`）。count.js 在 **load 之后动态注入**（绝不拖延 load 事件，避免第三方 CDN 拖慢 astro:page-load 初始化）；SPA 模式（`no_onload`）由 Layout 在 `astro:page-load` 手动上报（未就绪时轮询等待）；首页「总浏览」读 `counter/TOTAL.json`（服务端最长 4h 缓存）；**文章页浏览数**（2026-10）：Layout 的 `loadPostViews` 在 `astro:page-load` 查 `counter/{encodeURIComponent(location.pathname + location.search)}.json`（路径编码语义与上报的 `p` 参数一致，实测 `/about/` 可命中；CORS 开放），填进 `[id].astro` meta 行的 `[data-post-views]`，显示「N 次浏览 · M 人访问」（count / count_unique）；**404 按 0 显示**，请求失败保持占位 `—`；每页一个请求、`dataset.done` 防重复

## 易错点 / CSS Gotchas

- **UI/样式改动必须按「UI 改动工作流」截图核验后交付**，禁止盲改。
- **格式化交给 `npm run format`**，别手调缩进/引号，`prettier --check .` 不干净 CI 体验会差。
- Astro scoped 样式覆盖不到 markdown 渲染出的内容，需要用 `:global()`。
- **通用件只在 `src/styles/` 定义一次**。页面 `<style>` 只放该页独有样式——曾经 `index.astro` 把 `components.css` 整份复制（~200 行），改样式时改的那份不生效。
- `base.css` 的 `main` **不再有** `max-width` / `padding`（2026-10 精简时移除）。内容宽度由 `layouts.css` 的 `.main-content` / `.full-width` 决定，页面不要再靠 `!important` 覆盖 `main`。
- **博客列表页排序依赖 `data-date` 属性的字符串比较**（`localeCompare`）— 必须输出 ISO 字符串这类定长可排序格式，改日期输出时勿破坏。
- **改类名要同步 JS 选择器**：筛选/排序脚本用 `closest('.side-panel-item')` 等类名查询 DOM，重命名 CSS 类而漏改脚本会让功能静默失效（踩过：`.sidebar-item` → `.side-panel-item`）。
- `.astro` 的三元/表达式分支里**不能写 HTML 注释**（Astro 编译器容忍但 prettier 的 astro 解析器会崩）；`.css` 文件写纯 CSS，别套 `<style>` 标签。
- Giscus 评论配置（repo/category ID）在 `src/config.ts` 的 `GISCUS`，不在页面里。
- `.astro/` 和 `dist/` 是生成产物 — 永远不要直接编辑。
- **View Transitions 已启用**：脚本必须遵守「页面前端」一节的三原则（page-load 重 init / 文档级监听只绑一次 / 主题 after-swap 重放），否则会出现重复绑定、元素引用失效等诡异 bug。
- **固定定位的全屏遮罩别放页面容器内**：祖先若形成 stacking context，遮罩会被压在顶栏下面——挂到 `<body>` 下 + 全局样式（参考灯箱做法）。
- **单列媒体查询要重置显式的 `grid-column`**：布局塌成单列后，子元素残留的 `grid-column: 2` 会生成幽灵第二列——若网格带 `column-gap`，内容会被整体推偏（踩过：移动端文章页右偏 40px、两边不对称）。
- **半透明主色不要硬编码**：写 `rgba(var(--color-primary-rgb), α)`。硬编码 `rgba(8, 145, 178, α)` 在暗色模式下会与提亮后的主色 `#22a3c7` 偏色。

## 待办 / TODO

- **字体自托管**：当前 JetBrains Mono 走 Google Fonts、霞鹜文楷走 jsdelivr（`SeoHead.astro`）——国内访问不稳，实测 jsdelivr 慢时十几个 woff2 分片会把页面 `load` 事件拖到 10s+。方案：自托管 unicode-range 分片子集（如 `lxgw-wenkai-webfont`）+ `@fontsource/jetbrains-mono`，替换 CDN 引用。
- **UI 待办（C 组·首页）**：hero 行动引导（读文章 / RSS）已于 2026-10 完成；总浏览计数并入 hero。
- **per-post OG 分享卡（D 组唯一遗留）**：satori 按标题生成。先决问题：CJK 字库方案（~10MB 字体入库或构建期下载），待拍板。

## UI 改动工作流：先截图，再交付

改任何视觉/布局的东西**必须**用无头浏览器看渲染截图再交付，不要只看代码就下结论（血泪教训：导航被挤、按钮丑都是盲改出来的）。

**环境已就绪**（一次性配置，均已装好，勿重复装）：

- playwright + chromium：toolkit 环境（`/home/r1t0/miniconda3/envs/toolkit/bin/playwright`），浏览器在 `~/.cache/ms-playwright/`；缺失的系统库已用 conda-forge 装进 toolkit（本机无免密 sudo，走不了 apt）
- **启动浏览器必须带库路径**：`p.chromium.launch(env={'LD_LIBRARY_PATH': '/home/r1t0/miniconda3/envs/toolkit/lib'})`

**流程**：

1. `npm run build`
2. 起静态服务：`cd dist && python3 -m http.server 8877`——**用后台任务方式起**（普通 `&` 会随 shell 退出被回收）
3. 截图脚本用 toolkit python 跑（临时放 `/tmp/opencode/shoot*.py`）：

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(env={'LD_LIBRARY_PATH': '/home/r1t0/miniconda3/envs/toolkit/lib'})
    pg = b.new_page(viewport={'width': 1280, 'height': 800})  # 桌面
    m = b.new_page(viewport={'width': 390, 'height': 844})    # 移动
    pg.goto('http://localhost:8877/...', wait_until='load')
    pg.wait_for_timeout(500)
    pg.locator('.某元素').screenshot(path='/tmp/opencode/shots/x.png')
    b.close()
```

4. 用 read 工具**逐张看截图**；不满意就改样式 → 重建 → 再截，直到顺眼
5. **多方案比稿**：写一个 `variants.html` 用站点 CSS 变量把候选排开、整页截图择优，再落地（比反复改真页面高效）
6. 坑：`locator('header')` 会撞名（站点 header 与 `.post-header`），用 `.first` 或更精确选择器

交付前把关键页面（首页/列表/文章 × 桌面/移动）整体扫一遍截图。

## 部署

推送 `main` → `.github/workflows/deploy.yml` → 构建（`npm ci` + `npm run build`）→ GitHub Pages。构建前从私有 vault 仓库拉取 `20_blog/`（sparse-checkout + 搬运，需 `BLOG_REPO_TOKEN`）。

⚠️ **推送 vault（发新文章）不会触发部署** — `deploy.yml` 只监听网站仓库的 push。已选**定时 + 手动**：`schedule` 每 2 小时自动重建（公共仓库 Actions 免费，上线延迟最多 2 小时），急用时到 Actions 页对 deploy workflow 点 "Run workflow"（`workflow_dispatch` 已配置）。将来想要即时上线可在 vault 加 push workflow 调本站 `workflow_dispatch`（需第二个 token，Actions: Read and write）。

忽略 `tmp/` 和 `.claude/`（临时/本地目录）。
