import type { APIRoute } from 'astro';
import { getArticleEntries, type ArticleEntry } from '../../lib/entries';
import { renderArticleImage, renderSiteImage } from '../../lib/og';

export async function getStaticPaths() {
  const articles = await getArticleEntries();
  return [
    { params: { slug: 'site' }, props: { article: undefined } },
    ...articles.map((article) => ({ params: { slug: article.slug }, props: { article } })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const { article } = props as { article?: ArticleEntry };

  const png = article
    ? await renderArticleImage({
        kicker: `N° ${article.number}${article.series ? ` · Partie ${article.series.part}/${article.series.total}` : ''}`,
        title: article.headline,
        description: article.metaDescription || article.description,
        footer: `${article.publishedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} · numeolab.fr`,
      })
    : await renderSiteImage();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
