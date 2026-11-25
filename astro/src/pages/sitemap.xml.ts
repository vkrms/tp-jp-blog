// sitemap.xml: indexed pages only — the JA pages (docs/spec.md §8.3). EN is closed from search
// (noindex, no hreflang; README §9), so it is not listed and no language alternates are declared.
import type { APIRoute } from 'astro';
import { articles } from '../data/content';

const site = (import.meta.env.SITE ?? '').replace(/\/+$/, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const page = (loc: string, lastmod?: string) => `  <url>
    <loc>${esc(loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}  </url>`;

export const GET: APIRoute = () => {
  const urls = [
    page(`${site}/`),
    page(`${site}/articles/`),
    page(`${site}/glossary/`),
    ...articles.map((a) => page(`${site}/articles/${a.slug}/`, a.updated_at)),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
