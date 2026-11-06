# Numeolab — Blog

Blog "build-in-public" de Numeolab, propulsé par [Astro](https://astro.build) en mode statique, avec [Directus](https://directus.io) comme CMS headless et [Umami](https://umami.is) pour les statistiques.

Le site est déployé sur Cloudflare Pages.

## 🚀 Structure du projet

```text
├── public/                  # Assets statiques (favicons, polices, robots.txt...)
├── src/
│   ├── components/          # Composants Astro réutilisables
│   ├── directus/            # Client Directus, schémas Zod, adaptateurs, loaders
│   ├── layouts/              # Layouts de pages (article, page statique)
│   ├── pages/                # Routes (file-based routing)
│   ├── consts.ts             # Constantes globales du site
│   └── content.config.ts     # Déclaration des collections Astro (articles, projets)
├── astro.config.mjs
├── wrangler.jsonc            # Config de déploiement Cloudflare Pages
└── package.json
```

Les contenus (articles, projets) ne sont pas des fichiers Markdown locaux : ils sont chargés à la compilation depuis une instance Directus via les loaders définis dans `src/directus/`.

## ⚙️ Variables d'environnement

| Variable | Description |
| :--- | :--- |
| `DIRECTUS_URL` | URL de l'instance Directus utilisée comme source de contenu |
| `DIRECTUS_TOKEN` | Token d'accès (optionnel) pour l'API Directus |
| `PUBLIC_UMAMI_SCRIPT_URL` | URL du script Umami (analytics, chargé uniquement en production) |
| `PUBLIC_UMAMI_WEBSITE_ID` | Identifiant du site sur Umami |

## 🧞 Commandes

Toutes les commandes s'exécutent à la racine du projet, depuis un terminal :

| Commande | Action |
| :--- | :--- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Démarre le serveur local sur `localhost:4321` |
| `npm run build` | Build le site en statique dans `./dist/` |
| `npm run preview` | Prévisualise le build en local avant déploiement |
| `npm run astro -- check` | Vérifie les types (utilisé en CI) |

## 👀 Pour aller plus loin

Voir la [documentation Astro](https://docs.astro.build) et la [documentation Directus](https://directus.io/docs).
