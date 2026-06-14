import type { ArticleTag, ProjectStack } from './enums';
import type { DirectusArticleRaw, DirectusProjectRaw } from './schemas';

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: Date;
  updatedAt: Date | null;
  heroImageUrl: string | null;
  tags: ArticleTag[];
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string | null;
  publishedAt: Date;
  projectUrl: string | null;
  projectRepo: string | null;
  stack: ProjectStack[];
}

export function toArticle(
  raw: DirectusArticleRaw,
  resolveAsset: (id: string) => string
): Article {
  const publishedAt = new Date(raw.date_published ?? raw.date_created);
  const rawUpdatedAt = raw.date_updated ? new Date(raw.date_updated) : null;
  const updatedAt =
    rawUpdatedAt?.toDateString() === publishedAt.toDateString() ? null : rawUpdatedAt;

  return {
    id: raw.id,
    slug: raw.url_slug,
    title: raw.title,
    description: raw.description,
    content: raw.content,
    publishedAt,
    updatedAt,
    heroImageUrl: raw.featured_image ? resolveAsset(raw.featured_image) : null,
    tags: raw.tags as ArticleTag[],
    metaTitle: raw.meta_title,
    metaDescription: raw.meta_description,
  };
}

export function toProject(raw: DirectusProjectRaw): Project {
  return {
    id: raw.id,
    slug: raw.url_slug,
    title: raw.title,
    description: raw.description,
    content: raw.content,
    publishedAt: new Date(raw.date_published ?? raw.date_created),
    projectUrl: raw.project_url,
    projectRepo: raw.project_repo,
    stack: raw.stack as ProjectStack[],
  };
}
