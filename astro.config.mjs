// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://rito-492.github.io',
	output: 'static',
	integrations: [
		sitemap({
			filter: (page) => !page.endsWith('/404/'),
		}),
	],
});
