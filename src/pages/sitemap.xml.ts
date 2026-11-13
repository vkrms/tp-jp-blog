// sitemap.xml: one URL per page and article, in both languages (docs/spec-stage1.md §6).
import type { APIRoute } from 'astro';
import { articles } from '../data/content';

const site = (import.meta.env.SITE ?? '').replace(/\/+$/, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const page = (loc: string, lastmod?: string) =>
  `  <url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;

export const GET: APIRoute = () => {
  const urls = [
    page(`${site}/`),
    page(`${site}/en/`),
    page(`${site}/articles/`),
    page(`${site}/en/articles/`),
    page(`${site}/glossary/`),
    page(`${site}/en/glossary/`),
  ];
  for (const a of articles) {
    urls.push(page(`${site}/articles/${a.slug}/`, a.updated_at));
    urls.push(page(`${site}/en/articles/${a.slug}/`, a.updated_at));
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
