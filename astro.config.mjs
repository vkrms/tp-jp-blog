import { defineConfig } from 'astro/config';

// Dev only: send /articles -> /articles/ instead of Astro's 404 "trailing slash" page.
// Astro unshifts its own check in a post-setup hook, so ours must run after it to end up in front.
// (On Hostinger/Apache, mod_dir already does this for directory builds.)
const devSlashRedirect = {
  name: 'dev-trailing-slash-redirect',
  enforce: 'post',
  configureServer(server) {
    return () => {
      server.middlewares.stack.unshift({
        route: '',
        handle(req, res, next) {
          const [pathname, query = ''] = (req.url || '').split('?');
          if (req.method === 'GET' && !pathname.endsWith('/') && !pathname.split('/').pop().includes('.') && !pathname.startsWith('/@') && !pathname.startsWith('/_')) {
            res.statusCode = 301;
            res.setHeader('Location', pathname + '/' + (query ? '?' + query : ''));
            return res.end();
          }
          next();
        },
      });
    };
  },
};

// SITE_URL / INDEXING are build-time variables (see docs/spec-stage1.md §4, §6)
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { plugins: [devSlashRedirect] },
  i18n: { defaultLocale: 'ja', locales: ['ja', 'en'], routing: { prefixDefaultLocale: false } },
});
