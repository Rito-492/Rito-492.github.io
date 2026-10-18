import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseDate } from './lib/date';

// 可选字段容错：Obsidian 里“清空值但保留键”（如 `modDate:`）时 YAML 解析为 null，
// 统一视为未填，避免 schema 校验失败导致构建中断
const emptyToUndefined = (v: unknown) => (v === null || v === '' ? undefined : v);
const optionalText = z.preprocess(emptyToUndefined, z.string().optional());
const optionalDate = z.preprocess(
	emptyToUndefined,
	z.union([z.string(), z.number()]).transform(parseDate).optional(),
);

const blogCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// 日期在 schema 层统一转成 Date（string/number 两种写法都接受），页面无需再解析
		pubDate: z.union([z.string(), z.number()]).transform(parseDate),
		modDate: optionalDate,
		isPublished: z.boolean().optional(),
		tags: z.array(z.string()),
		series: optionalText,
		abstract: optionalText,
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
