import { defineCollection, z } from 'astro:content';
import { articlesLoader, projectsLoader } from './directus/loader';
import { ARTICLE_TAGS, PROJECT_STACK } from './directus/enums';

const articleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  publishedAt: z.date(),
  updatedAt: z.date().nullable(),
  heroImageUrl: z.string().nullable(),
  tags: z.array(z.enum(ARTICLE_TAGS)),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
});

const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string().nullable(),
  publishedAt: z.date(),
  projectUrl: z.string().nullable(),
  projectRepo: z.string().nullable(),
  stack: z.array(z.enum(PROJECT_STACK)),
});

export const collections = {
  articles: defineCollection({ loader: articlesLoader, schema: articleSchema }),
  projects: defineCollection({ loader: projectsLoader, schema: projectSchema }),
};
