// 兼容 Obsidian 的几种插图写法，统一成标准图片引用后交给 Astro 图片管线：
//   1. ![[图.jpg]]             → 按文件名在内容目录内递归查找（忽略大小写 / jpg-jpeg 别名）
//   2. ![](20_blog/assets/x)   → 去掉 vault 根前缀，换算成相对文章的路径（大小写不一致时按名兜底）
//   3. 标准相对路径 ![](assets/x) → 原样放行（Astro 原生处理）
//   4. [文字](##标题)          → 改写成 [文字](#标题)（Obsidian 的标题锚点写法）
// 说明：`![[图.jpg|400]]` 的数字宽度参数暂不支持（数字会被忽略，非数字当作 alt）。
import { existsSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join, relative, sep } from 'node:path';

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
const EMBED_RE = /!\[\[([^\[\]|]+)(?:\|([^\[\]]*))?\]\]/g;
const VAULT_PREFIX = '20_blog/';

// 文件名归一化：忽略大小写，且 .jpeg 与 .jpg 视为同一扩展名
// （Windows/Obsidian 大小写不敏感，Linux 构建严格区分，靠这里兜底）
const normalizeName = (name) => name.toLowerCase().replace(/\.jpeg$/, '.jpg');

export default function remarkObsidianImages() {
	return (tree, file) => {
		const filePath = file?.path ?? file?.history?.[0];
		if (!filePath) return;
		const fileDir = dirname(filePath);

		let index = null;
		const imageIndex = () => {
			if (index) return index;
			index = new Map();
			const walk = (dir) => {
				for (const entry of readdirSync(dir, { withFileTypes: true })) {
					const full = join(dir, entry.name);
					if (entry.isDirectory()) {
						walk(full);
					} else if (IMAGE_RE.test(entry.name)) {
						const key = normalizeName(entry.name);
						if (index.has(key)) {
							console.warn(
								`[remark-obsidian-images] 图片重名（忽略大小写/jpg-jpeg），取先找到的：${entry.name}`,
							);
						} else {
							index.set(key, full);
						}
					}
				}
			};
			walk(fileDir);
			return index;
		};

		const toPosix = (p) => p.split(sep).join('/');

		// 按文件名找图 → 相对文章文件的路径
		const resolveByName = (name) => {
			const hit = imageIndex().get(normalizeName(basename(name)));
			return hit ? toPosix(relative(fileDir, hit)) : null;
		};

		// 20_blog/xxx → 相对文章文件的路径（自下而上逐级尝试，兼容文章放子目录的情况）
		const resolveVaultPath = (url) => {
			const rel = url.slice(VAULT_PREFIX.length);
			let base = fileDir;
			for (let i = 0; i < 4; i++) {
				const candidate = join(base, rel);
				if (existsSync(candidate)) return toPosix(relative(fileDir, candidate));
				base = dirname(base);
			}
			// 兜底：路径里的大小写 / .jpg ↔ .jpeg 不一致时，按文件名匹配
			const hit = imageIndex().get(normalizeName(basename(rel)));
			if (hit) {
				console.warn(
					`[remark-obsidian-images] 路径与文件名不完全一致，已按文件名兜底匹配：${url}`,
				);
				return toPosix(relative(fileDir, hit));
			}
			return null;
		};

		// 把一段文字里的 ![[图]] 拆成 文字 + 图片节点 的序列
		const splitEmbeds = (node) => {
			if (!node.value.includes('![[')) return [node];
			const parts = [];
			let last = 0;
			for (const match of node.value.matchAll(EMBED_RE)) {
				if (match.index > last) {
					parts.push({ type: 'text', value: node.value.slice(last, match.index) });
				}
				const name = match[1].trim();
				const raw = (match[2] ?? '').trim();
				const url = resolveByName(name);
				if (url) {
					const alt =
						raw && !/^\d+(?:x\d+)?$/.test(raw) ? raw : basename(name, extname(name));
					parts.push({ type: 'image', url, alt });
				} else {
					console.warn(`[remark-obsidian-images] 找不到图片「${name}」（${filePath}）`);
					parts.push({ type: 'text', value: match[0] });
				}
				last = match.index + match[0].length;
			}
			if (last < node.value.length) {
				parts.push({ type: 'text', value: node.value.slice(last) });
			}
			return parts;
		};

		const transform = (parent) => {
			if (!parent.children) return;
			parent.children = parent.children.flatMap((child) => {
				if (child.type === 'text') return splitEmbeds(child);
				if (child.type === 'image') {
					const url = child.url?.replace(/^\.\//, '') ?? '';
					if (url.startsWith(VAULT_PREFIX)) {
						const fixed = resolveVaultPath(url);
						if (fixed) {
							child.url = fixed;
						} else {
							console.warn(
								`[remark-obsidian-images] 找不到图片：${child.url}（${filePath}）`,
							);
						}
					}
				}
				if (child.type === 'link' && child.url?.startsWith('##')) {
					child.url = child.url.slice(1);
				}
				transform(child);
				return [child];
			});
		};

		transform(tree);
	};
}
