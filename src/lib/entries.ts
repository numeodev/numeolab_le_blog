import { getCollection } from 'astro:content';
import type { Article, Project } from '../directus/api';

// ── Conventions éditoriales du carnet ───────────────────────────────────────
// Entrée (article) : « N° 004 », trois chiffres dans l'ordre de publication.
// Réalisation : « P-01 », deux chiffres dans l'ordre de création.
// Série : déduite du titre « <Nom de la série> — Partie <n> : <titre> ».

export interface Series {
  name: string;
  part: number;
  total: number;
}

export interface ArticleEntry extends Article {
  number: string;
  /** Titre sans le préfixe de série, affiché en titre de page. */
  headline: string;
  series: Series | null;
}

export interface ProjectEntry extends Project {
  number: string;
}

export interface Theme {
  name: string;
  slug: string;
  count: number;
}

const SERIES_TITLE = /^(.+?)\s+[—–]\s+Partie\s+(\d+)\s*:\s*(.+)$/i;

const byNewest = (a: { publishedAt: Date }, b: { publishedAt: Date }) =>
  b.publishedAt.getTime() - a.publishedAt.getTime();

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('fr-FR') + s.slice(1);

export async function getArticleEntries(): Promise<ArticleEntry[]> {
  const articles = (await getCollection('articles')).map((e) => e.data as Article).sort(byNewest);

  const parsed = articles.map((article, i) => {
    const match = article.title.match(SERIES_TITLE);
    return {
      article,
      number: String(articles.length - i).padStart(3, '0'),
      headline: match ? capitalize(match[3]) : article.title,
      seriesName: match?.[1],
      part: match ? Number(match[2]) : 0,
    };
  });

  const seriesTotals = new Map<string, number>();
  for (const { seriesName, part } of parsed) {
    if (seriesName) seriesTotals.set(seriesName, Math.max(seriesTotals.get(seriesName) ?? 0, part));
  }

  return parsed.map(({ article, number, headline, seriesName, part }) => ({
    ...article,
    number,
    headline,
    series: seriesName ? { name: seriesName, part, total: seriesTotals.get(seriesName)! } : null,
  }));
}

export async function getProjectEntries(): Promise<ProjectEntry[]> {
  const projects = (await getCollection('projects')).map((e) => e.data as Project).sort(byNewest);
  return projects.map((project, i) => ({
    ...project,
    number: `P-${String(projects.length - i).padStart(2, '0')}`,
  }));
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getThemes(articles: ArticleEntry[]): Theme[] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'));
}

export function groupByYear<T extends { publishedAt: Date }>(items: T[]): [number, T[]][] {
  const groups = new Map<number, T[]>();
  for (const item of items) {
    const year = item.publishedAt.getFullYear();
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }
  return [...groups];
}

// ── Sommaire ────────────────────────────────────────────────────────────────

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADING = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;

const decodeEntities = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;/g, '’');

/** Ajoute un `id` aux intertitres h2/h3 du contenu et en extrait le sommaire. */
export function withHeadingIds(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();

  const result = html.replace(HEADING, (_, level: string, attrs: string, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, '')).trim();
    const existing = attrs.match(/\sid=["']([^"']+)["']/)?.[1];
    let id = existing ?? (slugify(text) || 'section');
    if (!existing) {
      const base = id;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    }
    used.add(id);
    if (text) headings.push({ id, text, level: Number(level) as 2 | 3 });
    const idAttr = existing ? '' : ` id="${id}"`;
    return `<h${level}${idAttr}${attrs}>${inner}</h${level}>`;
  });

  return { html: result, headings };
}
