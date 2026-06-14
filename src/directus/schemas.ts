import { z } from 'zod';

export const directusArticleSchema = z.object({
  id: z.coerce.string(),
  status: z.enum(['published', 'draft', 'archived']),
  date_created: z.string(),
  date_published: z.string().nullable(),
  date_updated: z.string().nullable(),
  title: z.string(),
  url_slug: z.string(),
  description: z.string(),
  content: z.string(),
  featured_image: z.string().nullable(),
  tags: z.array(z.string()),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
});

export const directusProjectSchema = z.object({
  id: z.coerce.string(),
  status: z.enum(['published', 'draft']),
  date_created: z.string(),
  date_published: z.string().nullable(),
  title: z.string(),
  url_slug: z.string(),
  description: z.string(),
  content: z.string().nullable(),
  project_url: z.string().nullable(),
  project_repo: z.string().nullable(),
  stack: z.array(z.string()),
});

export type DirectusArticleRaw = z.infer<typeof directusArticleSchema>;
export type DirectusProjectRaw = z.infer<typeof directusProjectSchema>;
