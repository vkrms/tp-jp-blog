import { defineConfig } from 'astro/config';

const SITE_URL = process.env.SITE_URL;
const INDEXING = process.env.INDEXING === 'true';

// Guard: an indexed production build must have a real site URL, otherwise canonical/hreflang and
// the sitemap would ship as localhost. Dev/preview builds (INDEXING unset) are unaffected.
if (INDEXING && (!SITE_URL || /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(SITE_URL))) {
  throw new Error(`INDEXING=true requires SITE_URL to be a public URL (got: ${SITE_URL ?? 'unset'})`);
}

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
  site: SITE_URL || 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { plugins: [devSlashRedirect] },
  i18n: { defaultLocale: 'ja', locales: ['ja', 'en'], routing: { prefixDefaultLocale: false } },
});
