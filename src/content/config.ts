import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: image().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: image().optional(),
  }),
});

const apps = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/apps' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    appType: z.enum(['threejs', 'canvas', 'other']),
    heroImage: z.string().optional(),
  }),
});

export const collections = { articles, projects, apps };
