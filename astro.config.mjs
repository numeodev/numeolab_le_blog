// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://numeolab.fr",
  output: "static",
  trailingSlash: "always",
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  integrations: [
    sitemap(),
    compress({
      CSS: true,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true,
    }),
  ],
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
    remotePatterns: [{ protocol: "https" }],
    domains: ["numeolab.fr"],
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
    },
  },
});
