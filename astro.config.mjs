// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://kashidwar.com',
  output: 'static',
  // Cloudflare Pages 308-redirects directory URLs to the trailing-slash form,
  // so the whole site (canonicals, sitemap, internal links) uses that form too.
  trailingSlash: 'always',
  // English at the root; Hindi/Tamil/Telugu under /hi /ta /te prefixes.
  // Phase 3 localises the map experience + chrome; long-form articles follow later.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi', 'ta', 'te'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
