import { defineConfig } from 'astro/config';

// SITE_URL / INDEXING are build-time variables (see docs/spec-stage1.md §4, §6)
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: { defaultLocale: 'ja', locales: ['ja', 'en'], routing: { prefixDefaultLocale: false } },
});
