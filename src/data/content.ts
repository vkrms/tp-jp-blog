// Single place where site code reads repo-level content (content/). Stage 2 swaps this for an API.
import articlesRaw from '../../content/articles.json';
import categoriesRaw from '../../content/categories.json';
import glossaryRaw from '../../content/glossary.json';

/** Bilingual content text: [ja, en] or { ja, en } (both forms exist in content/). */
export type Text = unknown;

export interface Img {
  /** Path relative to content/, e.g. images/sales-calendar/01.jpg */
  src: string;
  alt: Text;
  caption: Text;
  /** Internal prompt for the image agent — never rendered. */
  prompt_scene?: Text;
}

export interface ArticleTable { head: Text[]; rows: Text[][] }

/** A section body block. Exactly one key is set (see docs/spec-stage1.md §3.2). */
export type Block =
  | { p: Text }
  | { h3: Text }
  | { img: Img }
  | { table: ArticleTable }
  | { steps: Text[] }
  | { list: Text[] }
  | { say: Text }
  | { point: [Text, Text] }
  | { warn: [Text, Text] }
  | { diff: [Text, Text] };

export interface Section { h: Text; b: Block[] }
export type FaqEntry = [Text, Text];
export interface UpdateLogEntry { date: string; public: Text; internal_note?: Text }

export interface Article {
  slug: string;
  category: string;
  level: 0 | 1;
  read_minutes: number;
  keyword?: string;
  title: Text;
  eyebrow: Text;
  answer_first: Text;
  sections: Section[];
  faq: FaqEntry[];
  matome: Text[];
  /** Source ids from content/sources.json — never rendered (agents/rules.md). */
  sources?: string[];
  related?: string[];
  updated_at: string;
  update_log: UpdateLogEntry[];
  review_status?: string;
  icon?: string;
}

export interface Category { id: string; t: [string, string]; c: string }
export interface Term { term_ja: string; term_en: string; kind: string }

export const articles = (articlesRaw as unknown as Article[]).slice();
export const categories = categoriesRaw as Category[];
export const glossary = glossaryRaw as Term[];
export const category = (id: string) => categories.find((c) => c.id === id);

export const article = (slug: string) => articles.find((a) => a.slug === slug);

/** Related articles in the order the content lists them; missing slugs are skipped. */
export const relatedOf = (a: Article): Article[] =>
  (a.related ?? []).map((slug) => article(slug)).filter((x): x is Article => Boolean(x));

/** First publish date, from the update log (fallback: updated_at). */
export const publishedAt = (a: Article) => a.update_log?.[0]?.date ?? a.updated_at;
