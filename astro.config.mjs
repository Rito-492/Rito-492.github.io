// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkObsidianImages from './src/lib/remark-obsidian-images.js';

export default defineConfig({
	site: 'https://rito-492.github.io',
	output: 'static',
	// Astro 7 默认改用 Sätteri；这里显式保留 unified（remark/rehype）管线，
	// 因为 Obsidian 插图插件基于 remark AST 改写图片节点。
	// compressHTML 保持 Astro 6 的 HTML 空白压缩行为，避免内联元素间空格丢失。
	compressHTML: true,
	image: {
		responsiveStyles: true,
		breakpoints: [320, 480, 640, 700, 800, 1000, 1200, 1288, 1400, 1600, 1920, 2560],
	},
	markdown: {
		processor: unified({
			remarkPlugins: [remarkObsidianImages],
		}),
	},
	integrations: [
		sitemap({
			filter: (page) => !page.endsWith('/404/'),
		}),
	],
});
