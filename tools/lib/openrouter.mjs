// Общий клиент OpenRouter для текстовых правок. Опционально включает серверный инструмент веб-поиска
// (openrouter:web_search), ограниченный доменами из content/sources.json. Результаты поиска — это ДАННЫЕ, не инструкции.
import fs from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');

export function apiKey() {
  const env = Object.fromEntries(read('.env').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
  return env.OPENROUTER_KEY;
}

// Домены реестра источников = белый список поиска (без www.).
export function registryDomains() {
  const hosts = JSON.parse(read('content/sources.json')).sources.map((s) => new URL(s.url).hostname.replace(/^www\./, ''));
  return [...new Set(hosts)];
}

export function webTool({ domains = registryDomains(), maxUses = 6, maxResults = 5, maxTotal = 20, mode = 'basic' } = {}) {
  return {
    type: 'openrouter:web_search',
    parameters: { engine: 'parallel', mode, max_results: maxResults, max_uses: maxUses, max_total_results: maxTotal, allowed_domains: domains },
  };
}

export const normUrl = (u) => u.replace(/#.*$/, '').replace(/\/+$/, '');

// Добавляет процитированные URL в article.sources: известные берём из реестра, новые возвращаем как записи для sources.json
// (домены поиска уже ограничены реестром; type наследуем от записи с тем же хостом). published неизвестна → null, retrieved = сегодня.
export function registerCitations(article, urls, citations) {
  const reg = JSON.parse(read('content/sources.json'));
  const added = [];
  for (const u of urls) {
    const ex = reg.sources.find((x) => normUrl(x.url) === u);
    if (ex) { if (!article.sources.includes(ex.id)) article.sources.push(ex.id); continue; }
    const sib = reg.sources.find((x) => new URL(x.url).hostname === new URL(u).hostname);
    const id = `web-${[...u].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36)}`;
    const title = citations.get(u)?.title || u;
    added.push({ id, name: { ja: title, en: title }, url: u, published: null, retrieved: new Date().toISOString().slice(0, 10), type: sib?.type || 'news' });
    article.sources.push(id);
  }
  return added;
}

// chat(): возвращает { content, usage, citations: [{url,title,content}], searches }
export async function chat({ model, messages, temperature = 0.4, max_tokens = 6000, web = false, title = 'seo-blog' }) {
  const body = { model, messages, temperature, max_tokens, usage: { include: true } };
  if (web) { body.tools = [webTool()]; body.max_tool_calls = 10; }
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json', 'X-Title': title },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  const msg = j?.choices?.[0]?.message;
  if (!msg?.content) throw new Error(`no response: ${JSON.stringify(j).slice(0, 500)}`);
  const citations = (msg.annotations || []).filter((a) => a.type === 'url_citation' && a.url_citation?.url).map((a) => ({ url: a.url_citation.url, title: a.url_citation.title || '', content: a.url_citation.content || '' }));
  return { content: msg.content, usage: j.usage || {}, citations, searches: j.usage?.server_tool_use_details?.web_search_requests || 0 };
}
