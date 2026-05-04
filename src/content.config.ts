import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.string(),
		lastUpdated: z.string().optional(),
		draft: z.boolean().optional(),
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
