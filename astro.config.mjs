// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkObsidianImages from './src/lib/remark-obsidian-images.js';

export default defineConfig({
	site: 'https://rito-492.github.io',
	output: 'static',
	image: {
		responsiveStyles: true,
		breakpoints: [320, 480, 640, 700, 800, 1000, 1200, 1288, 1400, 1600, 1920, 2560],
	},
	markdown: {
		remarkPlugins: [remarkObsidianImages],
	},
	integrations: [
		sitemap({
			filter: (page) => !page.endsWith('/404/'),
		}),
	],
});
