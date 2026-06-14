import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../consts";

export async function GET(context: APIContext) {
  const entries = await getCollection("articles");
  const articles = entries.map((e) => e.data);

  const siteUrl = (context.site?.toString() ?? SITE_URL).replace(/\/$/, "");

  return rss({
    title: `${SITE_TITLE} - Flux RSS`,
    description: SITE_DESCRIPTION,
    site: siteUrl,
    items: articles.map((article) => ({
      title: article.title,
      description: article.description,
      pubDate: article.publishedAt,
      link: `${siteUrl}/blog/${article.slug}/`,
      categories: article.tags,
    })),
    customData: `<language>fr-FR</language>`,
    stylesheet: "/rss.xsl",
  });
}
