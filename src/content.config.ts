import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseDate } from './lib/date';

const blogCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// 日期在 schema 层统一转成 Date（string/number 两种写法都接受），页面无需再解析
		pubDate: z.union([z.string(), z.number()]).transform(parseDate),
		modDate: z.union([z.string(), z.number()]).transform(parseDate).optional(),
		isPublished: z.boolean().optional(),
		tags: z.array(z.string()),
		series: z.string().optional(),
		abstract: z.string().optional(),
	}),
});

const projectsCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		tech: z.array(z.string()),
		link: z.string().url().optional(),
		github: z.string().url().optional(),
		draft: z.boolean().optional(),
	}),
});

export const collections = {
	blog: blogCollection,
	projects: projectsCollection,
};
