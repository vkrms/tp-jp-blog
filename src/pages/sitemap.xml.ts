// sitemap.xml: one URL per page and article, in both languages (docs/spec-stage1.md §6).
// Each entry carries the full ja/en/x-default alternate set, so the language pairing is
// declared in the sitemap as well as in <link rel="alternate"> (BaseLayout.astro).
import type { APIRoute } from 'astro';
import { articles } from '../data/content';

const site = (import.meta.env.SITE ?? '').replace(/\/+$/, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A ja/en pair of the same page. x-default always points at the ja URL. */
interface Pair {
  ja: string;
  en: string;
  lastmod?: string;
}

const alt = (hreflang: string, href: string) =>
  `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${esc(href)}"/>`;

const page = (loc: string, pair: Pair) => `  <url>
    <loc>${esc(loc)}</loc>
${pair.lastmod ? `    <lastmod>${pair.lastmod}</lastmod>\n` : ''}${alt('ja', pair.ja)}
${alt('en', pair.en)}
${alt('x-default', pair.ja)}
  </url>`;

export const GET: APIRoute = () => {
  const pairs: Pair[] = [
    { ja: `${site}/`, en: `${site}/en/` },
    { ja: `${site}/articles/`, en: `${site}/en/articles/` },
    { ja: `${site}/glossary/`, en: `${site}/en/glossary/` },
  ];
  for (const a of articles) {
    pairs.push({
      ja: `${site}/articles/${a.slug}/`,
      en: `${site}/en/articles/${a.slug}/`,
      lastmod: a.updated_at,
    });
  }

  const urls = pairs.flatMap((p) => [page(p.ja, p), page(p.en, p)]);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
