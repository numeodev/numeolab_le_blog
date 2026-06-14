export const ARTICLE_TAGS = [
  'Frontend',
  'Backend',
  'DevOps',
  'Database',
  'Docker',
  'Tools',
  'Unix',
  'Projet',
  'Fonctionnel',
  'Carrière',
] as const;

export const PROJECT_STACK = [
  'React',
  'Angular',
  'VueJS',
  '.NET Blazor',
  '.NET',
  'ASP.NET',
  'Docker',
  'Kubernetes',
] as const;

export type ArticleTag = (typeof ARTICLE_TAGS)[number];
export type ProjectStack = (typeof PROJECT_STACK)[number];
