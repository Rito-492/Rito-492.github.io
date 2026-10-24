// 兼容 Obsidian 的几种插图写法，统一成标准图片引用后交给 Astro 图片管线：
//   1. ![[图.jpg]]             → 按文件名在内容目录内递归查找（忽略大小写 / jpg-jpeg 别名）
//   2. ![](20_blog/assets/x)   → 去掉 vault 根前缀，换算成相对文章的路径（大小写不一致时按名兜底）
//   3. 标准相对路径 ![](assets/x) → 原样放行（Astro 原生处理）
//   4. [文字](##标题)          → 改写成 [文字](#标题)（Obsidian 的标题锚点写法）
// 说明：`![[图.jpg|400]]` 的数字宽度参数暂不支持（数字会被忽略，非数字当作 alt）。
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
const EMBED_RE = /!\[\[([^\[\]|]+)(?:\|([^\[\]]*))?\]\]/g;
const VAULT_PREFIX = '20_blog/';
const MAX_IMAGE_WIDTH = 1288; // 1320px 单栏断点减去左右各 1rem
const IMAGE_SIZES = '(min-width: 1321px) 700px, calc(100vw - 2rem)';

// 文件名归一化：忽略大小写，且 .jpeg 与 .jpg 视为同一扩展名
// （Windows/Obsidian 大小写不敏感，Linux 构建严格区分，靠这里兜底）
const normalizeName = (name) => name.toLowerCase().replace(/\.jpeg$/, '.jpg');

export default function remarkObsidianImages() {
	const metadataCache = new Map();

	const readMetadata = (imagePath) => {
		try {
			const stats = statSync(imagePath);
			const cached = metadataCache.get(imagePath);
			if (cached?.size === stats.size && cached.mtimeMs === stats.mtimeMs) {
				return cached.result;
			}

			const result = sharp(imagePath)
				.metadata()
				.catch(() => null);
			metadataCache.set(imagePath, { size: stats.size, mtimeMs: stats.mtimeMs, result });
			return result;
		} catch {
			return Promise.resolve(null);
		}
	};

	return async (tree, file) => {
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

		const addResponsiveImageProps = async (node) => {
			const url = node.url?.replace(/^\.\//, '') ?? '';
			if (!url || URL.canParse(url) || url.startsWith('/')) return;

			const localPath = url.split(/[?#]/, 1)[0];
			let decodedPath = localPath;
			try {
				decodedPath = decodeURIComponent(localPath);
			} catch {
				// 保留原路径，后续找不到文件时就跳过优化。
			}

			const imagePath = resolve(fileDir, decodedPath);
			if (!existsSync(imagePath) || extname(imagePath).toLowerCase() === '.svg') return;

			const metadata = await readMetadata(imagePath);
			if (!metadata?.width || !metadata?.height) return;

			// Astro 的 SVG/动画图片不走这套静态栅格缩放，避免栅格化或丢帧。
			if (metadata.format === 'svg' || (metadata.pages ?? 1) > 1) return;

			// Sharp 会在 Astro 转换时应用 EXIF 方向；这里也用方向校正后的宽度，避免小图被拉大。
			const sourceWidth = metadata.autoOrient?.width ?? metadata.width;
			const width = Math.min(sourceWidth, MAX_IMAGE_WIDTH);
			const imageProps = {
				layout: 'constrained',
				width,
				sizes: IMAGE_SIZES,
				loading: 'lazy',
				decoding: 'async',
			};

			// 照片使用高质量 WebP；PNG 截图/图表保持无损；已有 WebP/AVIF 避免低质量二次转码。
			switch (metadata.format) {
				case 'jpeg':
					imageProps.format = 'webp';
					imageProps.quality = 85;
					break;
				case 'png':
					imageProps.format = 'png';
					break;
				case 'webp':
					imageProps.format = 'webp';
					imageProps.quality = 92;
					break;
				case 'avif':
					imageProps.format = 'avif';
					imageProps.quality = 85;
					break;
				default:
					imageProps.format = 'webp';
					imageProps.quality = 85;
			}

			node.data = {
				...node.data,
				hProperties: {
					...node.data?.hProperties,
					...imageProps,
				},
			};
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

		const transform = async (parent) => {
			if (!parent.children) return;
			const children = [];

			for (const child of parent.children) {
				if (child.type === 'text') {
					const parts = splitEmbeds(child);
					for (const part of parts) {
						if (part.type === 'image') await addResponsiveImageProps(part);
						children.push(part);
					}
					continue;
				}

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
					await addResponsiveImageProps(child);
				}

				if (child.type === 'link' && child.url?.startsWith('##')) {
					child.url = child.url.slice(1);
				}
				await transform(child);
				children.push(child);
			}

			parent.children = children;
		};

		await transform(tree);
	};
}
