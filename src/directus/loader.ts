import type { Loader } from 'astro/loaders';
import { getAllArticles, getAllProjects } from './api';

export const articlesLoader: Loader = {
  name: 'directus-articles',
  async load({ store, logger }) {
    store.clear();
    const articles = await getAllArticles();
    for (const article of articles) {
      store.set({ id: article.slug, data: article });
    }
    logger.info(`[Directus] ${articles.length} article(s) chargé(s).`);
  },
};

export const projectsLoader: Loader = {
  name: 'directus-projects',
  async load({ store, logger }) {
    store.clear();
    const projects = await getAllProjects();
    for (const project of projects) {
      store.set({ id: project.slug, data: project });
    }
    logger.info(`[Directus] ${projects.length} projet(s) chargé(s).`);
  },
};
