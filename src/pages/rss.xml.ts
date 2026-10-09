import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context: APIContext) {
	const posts = (await getCollection('blog', ({ data }) => data.isPublished)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site ?? SITE.url,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}`,
		})),
		customData: '<language>zh-CN</language>',
	});
}
