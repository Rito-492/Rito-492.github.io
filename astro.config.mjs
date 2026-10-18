// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkObsidianImages from './src/lib/remark-obsidian-images.js';

export default defineConfig({
	site: 'https://rito-492.github.io',
	output: 'static',
	markdown: {
		remarkPlugins: [remarkObsidianImages],
	},
	integrations: [
		sitemap({
			filter: (page) => !page.endsWith('/404/'),
		}),
	],
});
