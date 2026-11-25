// robots.txt: allow crawling + point at the sitemap once indexing is on, otherwise block all
// (staging/preview builds keep `noindex` meta as well).
import type { APIRoute } from 'astro';

const site = (import.meta.env.SITE ?? '').replace(/\/+$/, '');
const indexing = process.env.INDEXING === 'true';

export const GET: APIRoute = () => {
  const body = indexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
