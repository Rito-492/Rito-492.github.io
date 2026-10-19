import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';
import { SITE } from '../config';

export async function GET(context: APIContext) {
	const posts = (await getCollection('blog', ({ data }) => data.isPublished)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const site = String(context.site ?? SITE.url).replace(/\/$/, '');
	const container = await AstroContainer.create();

	const items = await Promise.all(
		posts.map(async (post) => {
			// 全文输出：把文章渲染成 HTML，并把站内相对链接/图片改为绝对地址
			const { Content } = await render(post);
			const html = (await container.renderToString(Content))
				.replace(/<!--astro:end-->/g, '')
				.replaceAll('src="/', `src="${site}/`)
				.replaceAll('href="/', `href="${site}/`)
				.replaceAll(']]>', ']]&gt;');

			return {
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: `/blog/${post.id}`,
				// CDATA 包裹全文（与 WordPress 等主流生产者一致，阅读器兼容性最好）
				customData: `<content:encoded><![CDATA[${html}]]></content:encoded>`,
			};
		}),
	);

	return rss({
		title: SITE.title,
		description: SITE.description,
		site,
		xmlns: { content: 'http://purl.org/rss/1.0/modules/content/' },
		items,
		customData: '<language>zh-CN</language>',
	});
}
