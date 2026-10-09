# 内容集合说明

## 目录结构

```
src/content/
├── blog/       # 软链接 → 私有 garden 仓库的 20_blog/（不要提交进本仓库）
│   ├── _template.md
│   └── 你的文章.md
└── projects/   # 项目作品（真实目录，随网站代码维护）
    ├── _template.md
    └── 你的项目.md
```

> 博客文章实际存放在私有 Obsidian 库（garden）的 `20_blog/`，本地开发通过软链接接入，
> CI 构建时自动拉取。详见根目录 `AGENTS.md`「博客内容解耦」。

---

## 博客文章 (`blog/`)

### Frontmatter 字段

| 字段          | 必填 | 类型             | 说明                                             |
| ------------- | ---- | ---------------- | ------------------------------------------------ |
| `title`       | ✅   | string           | 文章标题                                         |
| `description` | ✅   | string           | 简短描述（列表页卡片）                           |
| `abstract`    | ❌   | string           | 文章摘要（标题下方）                             |
| `pubDate`     | ✅   | string \| number | 发布时间：`"2026_04_27_12_00"` 或 `202604271200` |
| `modDate`     | ❌   | string \| number | 最后编辑时间（同上格式）                         |
| `isPublished` | ❌   | boolean          | **true 才发布**（false/缺省 = 草稿，不构建页面） |
| `series`      | ❌   | string           | 系列名称                                         |
| `tags`        | ✅   | array            | 标签数组（至少一个）                             |

### 示例

```markdown
---
title: '我的文章'
description: '文章描述'
abstract: '文章摘要'
pubDate: '2026_04_27_12_00'
modDate: '2026_04_28_09_30'
isPublished: true
series: '学习笔记'
tags: ['React', '前端']
---

## 正文开始
```

---

## 项目作品 (`projects/`)

### Frontmatter 字段

| 字段          | 必填 | 类型    | 说明                |
| ------------- | ---- | ------- | ------------------- |
| `title`       | ✅   | string  | 项目名称            |
| `description` | ✅   | string  | 简短描述            |
| `tech`        | ✅   | array   | 技术栈数组          |
| `link`        | ❌   | URL     | 在线演示链接        |
| `github`      | ❌   | URL     | GitHub 仓库         |
| `draft`       | ❌   | boolean | 草稿（true 不显示） |

> ⚠️ 注意：项目集合用 `draft`（true = 隐藏），博客集合用 `isPublished`（true = 发布），语义相反，勿混用。

### 示例

```markdown
---
title: 'ProbMotion'
description: '基于 KAN 的概率人体运动预测模型'
tech: ['Python', 'PyTorch', 'Deep Learning']
github: 'https://github.com/Rito-492/ProbMotion'
draft: false
---

## 项目介绍

详细内容...
```

---

## 工作流程

1. **博客**：在 Obsidian（garden）里从 `01_template/20_blog.md` 模板新建 → 写作 → `isPublished: true` → push garden 仓库 → CI 自动部署（或到 Actions 手动 Run workflow）
2. **项目**：复制 `projects/_template.md` → 填 Frontmatter → 写正文 → push 本仓库
3. **本地预览**：`git -C ~/workspace/40_garden pull && npm run dev`
