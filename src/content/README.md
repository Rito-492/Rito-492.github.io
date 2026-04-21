# 内容集合说明

## 目录结构

```
src/content/
├── blog/       # 博客文章
│   ├── _template.md
│   └── 你的文章.md
└── projects/   # 项目作品
    ├── _template.md
    └── 你的项目.md
```

---

## 博客文章 (`blog/`)

### Frontmatter 字段

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `title` | ✅ | string | 文章标题 |
| `description` | ✅ | string | 简短描述 |
| `pubDate` | ✅ | date | 发布日期 (YYYY-MM-DD) |
| `draft` | ❌ | boolean | 草稿（true 不显示） |
| `tags` | ❌ | array | 标签数组 |

### 示例

```markdown
---
title: "我的文章"
description: "文章描述"
pubDate: 2026-04-21
draft: false
tags: ["React", "前端"]
---

## 正文开始
```

---

## 项目作品 (`projects/`)

### Frontmatter 字段

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `title` | ✅ | string | 项目名称 |
| `description` | ✅ | string | 简短描述 |
| `tech` | ✅ | array | 技术栈数组 |
| `link` | ❌ | URL | 在线演示链接 |
| `github` | ❌ | URL | GitHub 仓库 |
| `draft` | ❌ | boolean | 草稿 |

### 示例

```markdown
---
title: "ProbMotion"
description: "基于 KAN 的概率人体运动预测模型"
tech: ["Python", "PyTorch", "Deep Learning"]
github: "https://github.com/Rito-492/ProbMotion"
draft: false
---

## 项目介绍

详细内容...
```

---

## 工作流程

1. **复制模板** - 从 `_template.md` 开始
2. **填写 Frontmatter** - 必填字段
3. **写正文** - Markdown 格式
4. **预览** - 开发服务器自动刷新
5. **发布** - `draft: false` 并 push
