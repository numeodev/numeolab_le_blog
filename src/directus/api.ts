import { directusArticleSchema, directusProjectSchema } from './schemas';
import type { DirectusArticleRaw, DirectusProjectRaw } from './schemas';
import { toArticle, toProject } from './adapters';
import type { Article, Project } from './adapters';

export { type Article, type Project };

export const POSTS_PER_PAGE = 6;
export const PROJECTS_PER_PAGE = 6;

function getBaseUrl(): string {
  const url = import.meta.env.DIRECTUS_URL?.replace(/\/$/, '');
  if (!url) throw new DirectusUnavailableError();
  return url;
}

function getHeaders(): HeadersInit {
  const token = import.meta.env.DIRECTUS_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const FETCH_TIMEOUT_MS = 10_000;

async function directusFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const base = getBaseUrl();
  const url = new URL(path, base + '/');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url.toString(), { headers: getHeaders(), signal: controller.signal });
  } catch (err: unknown) {
    clearTimeout(timer);
    const e = err as NodeJS.ErrnoException & { cause?: NodeJS.ErrnoException };
    const code = e.code ?? e.cause?.code;
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
      throw new DirectusUnavailableError();
    }
    throw err;
  }
  clearTimeout(timer);
  if (!res.ok) throw new Error(`Directus error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

class DirectusUnavailableError extends Error {}

function warnIfUnavailable(err: unknown): void {
  if (!(err instanceof DirectusUnavailableError)) throw err;
  console.warn('[Directus] Instance unreachable — building with empty content.');
}

export function getAssetUrl(fileId: string): string {
  return `${getBaseUrl()}/assets/${fileId}`;
}

// ── Articles ────────────────────────────────────────────────────────────────

const ARTICLE_FIELDS = [
  'id', 'status', 'date_created', 'date_published', 'date_updated',
  'title', 'url_slug', 'description', 'content',
  'featured_image', 'tags', 'meta_title', 'meta_description',
] as const satisfies readonly (keyof DirectusArticleRaw)[];

export async function getAllArticles(): Promise<Article[]> {
  try {
    const res = await directusFetch<{ data: unknown[] }>('/items/articles', {
      'filter[status][_eq]': 'published',
      sort: '-date_published',
      limit: '-1',
      fields: ARTICLE_FIELDS.join(','),
    });
    return directusArticleSchema.array().parse(res.data).map(a => toArticle(a, getAssetUrl));
  } catch (err) {
    warnIfUnavailable(err);
    return [];
  }
}

// ── Projects ─────────────────────────────────────────────────────────────────

const PROJECT_FIELDS = [
  'id', 'status', 'date_created', 'date_published',
  'title', 'url_slug', 'description', 'content',
  'project_url', 'project_repo', 'stack',
] as const satisfies readonly (keyof DirectusProjectRaw)[];

export async function getAllProjects(): Promise<Project[]> {
  try {
    const res = await directusFetch<{ data: unknown[] }>('/items/projects', {
      'filter[status][_eq]': 'published',
      sort: '-date_published',
      limit: '-1',
      fields: PROJECT_FIELDS.join(','),
    });
    return directusProjectSchema.array().parse(res.data).map(toProject);
  } catch (err) {
    warnIfUnavailable(err);
    return [];
  }
}

