// UI strings (code, not content). Source: prototype/src/app.js → T. Pair = [ja, en].
export type Lang = 'ja' | 'en';
type P = readonly [string, string];

export const KEY = 'https://landings.travelpayouts.com/?tp_place=landing_jp-seo-blog';
/** Travelpayouts main site, Japanese edition (linked from the footer disclosure). */
export const MAIN_SITE_JP = 'https://travelpayouts.com/jp/';
/** Travelpayouts JP landing page, linked from the "About" nav item. */
export const ABOUT_URL = 'https://landings.travelpayouts.com/jp/';

export const T = {
  siteName: '旅アフィリ・ラボ',
  by: ['Travelpayouts が運営する旅行アフィリエイト情報サイト', 'Travel affiliate know-how, by Travelpayouts'],
  newsLabel: ['お知らせ', 'NEWS'],
  newsClose: ['お知らせを閉じる', 'Dismiss announcement'],
  news: ['新着：2026年11月の旅行セールの追い方', 'New: how to follow the November 2026 travel sales'],
  nav: { home: ['ホーム', 'Home'], articles: ['記事一覧', 'Articles'], glossary: ['用語集', 'Glossary'], about: ['このサイトについて', 'About'] },
  switchTo: ['English', '日本語'],
  heroH: ['<em>旅の発信</em>を、<br>収益につなげる<br>はじめの一歩', 'Turn <em>your travel content</em><br>into income:<br>the first step'],
  heroP: ['アフィリエイトの仕組みから、ジャンルの選び方、旅行ブログの収益化まで。日本の検索で使われている言葉で、順番にやさしく解説します。', 'From how affiliate marketing works to choosing a topic and monetising a travel blog, explained step by step in the words readers in Japan search with.'],
  cta: ['無料で登録する', 'Sign up free'],
  read: ['記事を読む', 'Read articles'],
  newH: ['新着記事', 'Latest articles'],
  all: ['すべての記事', 'All articles'],
  tabAll: ['すべて', 'All'],
  artsDesc: ['旅行アフィリエイトの基本から、ジャンルの選び方、AI検索時代の記事の書き方まで。カテゴリーで絞り込めます。', 'From affiliate basics to choosing a niche and writing for AI search. Filter by category.'],
  lvl: [['初級', 'Beginner'], ['中級', 'Intermediate']],
  mins: (n: number, l: Lang) => (l === 'ja' ? `${n}分で読めます` : `${n}min read`),
  stats: [
    ['11', ['ジャンル', ''], ['の旅行カテゴリーで収益化（宿泊・航空券・ツアー・送迎など）', 'travel verticals: stays, flights, tours, transfers and more']],
    ['24/7', ['', ''], ['人によるサポート。返信までの平均時間は26分', 'human Support around the clock; average reply time 26 minutes']],
    ['20', ['日', ''], ['までに、複数のブランドの収益を、毎月まとめてお支払い', 'Earnings from several brands paid together by the 20th of each month']],
  ],
  brandsH: ['紹介できる旅行カテゴリー', 'Travel categories you can promote'],
  verticals: [['ticket', ['航空券', 'Flights']], ['hotel', ['ホテル', 'Hotels']], ['pin', ['ツアー', 'Tours']], ['car', ['送迎・レンタカー', 'Transfers & cars']], ['shield', ['旅行保険', 'Insurance']], ['sim', ['eSIM', 'eSIM']]],
  gloH: ['用語をチェック', 'Check the terms'],
  gloAll: ['用語集を見る', 'Open glossary'],
  // glossary page
  gloPageH: ['アフィリエイト用語集', 'Affiliate glossary'],
  gloLead: ['日本のアフィリエイターが普段使う言葉と、Travelpayouts で使う言葉を、短く説明します。', 'Short explanations of the words affiliates in Japan use every day, and the words used at Travelpayouts.'],
  gloKinds: ['用語の種類', 'Term type'],
  gloTabAll: ['すべて', 'All'],
  gloTabGen: ['一般用語', 'General'],
  gloTabTp: ['Travelpayouts用語', 'Travelpayouts terms'],
  gloKindGen: ['一般', 'General'],
  gloKindTp: ['Travelpayouts', 'Travelpayouts'],
  gloSearch: ['用語を検索', 'Search terms'],
  gloEmpty: ['「{q}」に一致する用語はありません。', 'No terms match “{q}”.'],
  promoH: ['旅の発信を、収益につなげませんか？', 'Turn your travel content into income'],
  promoP: ['Travelpayouts では、複数の旅行ブランドのプログラムをひとつのプラットフォームで利用できます。登録は無料です。', 'On Travelpayouts you can use programs from several travel brands on one platform. Registration is free.'],
  join: ['Travelpayouts に参加する', 'Join Travelpayouts'],
  stbar: ['旅行ブログの収益化は、無料の登録から。', 'Start monetising your travel blog with a free sign-up.'],
  // Footer disclosure. The link text is rendered between these two halves.
  disclosurePre: ['AIの支援を受けて作成しています。本サイトはTravelpayoutsのメインサイトではありません。サービスの詳細は', 'Created with AI assistance. This site is not Travelpayouts’ main website. For service details, see '],
  disclosurePost: ['をご覧ください。', '.'],

  // article template
  upd: ['更新日', 'Updated'],
  published: ['初版公開', 'First published'],
  author: ['執筆：ラボ編集部', 'By the Lab editors'],
  tell: ['レベル', 'Level'],
  sum: ['この記事の要点', 'Key takeaway'],
  toc: ['目次', 'Contents'],
  faq: ['よくある質問', 'FAQ'],
  matH: ['まとめ', 'Summary'],
  logH: ['更新履歴', 'Update log'],
  readNext: ['次に読む', 'Read next'],
  inpost: ['Travelpayouts のパートナープラットフォームに参加しよう', 'Join the Travelpayouts partner platform'],
  inpostPh: ['青いドームの白い村を背に、バックパックを背負って笑う旅行者', 'A smiling traveller with a backpack in front of a white village with blue domes'],
  profH: ['編集部について', 'About the editors'],
  profName: ['ラボ編集部（マスコット：タビィ）', 'The Lab editors (mascot: Tabi)'],
  profP: ['旅行ブロガーのために、日本の検索で使われている言葉でアフィリエイトの基本をまとめています。', 'We explain affiliate basics for travel bloggers in the words people in Japan actually search with.'],
  // 更新前 / 更新後 labels for the diff block
  before: ['更新前', 'Before'],
  after: ['更新後', 'After'],
} as const;

export const tr = (p: P | readonly [string, string], l: Lang) => p[l === 'ja' ? 0 : 1];

/** Content text: [ja, en] or {ja, en} (both forms exist in content/). */
export const tx = (t: unknown, l: Lang): string =>
  Array.isArray(t) ? String(t[l === 'ja' ? 0 : 1] ?? '') : String((t as Record<string, string>)?.[l] ?? '');

/** Content text as plain text: strips the **bold** markers used in the JSON. */
export const plain = (t: unknown, l: Lang) => tx(t, l).replace(/\*\*/g, '');

/** Content text as HTML: escapes markup and turns **bold** into <mark> (the article highlight). */
export const rich = (t: unknown, l: Lang) =>
  tx(t, l)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 2026-11-09 -> 2026.11.09 (used in the article meta line). */
export const dateDots = (iso: string) => iso.replace(/-/g, '.');

/** 2026-11-09 -> 2026年11月9日 / 9 Nov 2026. */
export const dateLong = (iso: string, l: Lang) => {
  const [y, m, d] = iso.split('-').map(Number);
  return l === 'ja' ? `${y}年${m}月${d}日` : `${d} ${MONTHS[m - 1]} ${y}`;
};

/** Trim a description to a meta-description budget on a word boundary.
 *  Japanese has no spaces, so it falls back to a hard cut when no boundary is found. */
export const clip = (s: string, max: number) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const boundary = Math.max(cut.lastIndexOf(' '), cut.lastIndexOf('、'), cut.lastIndexOf('。'));
  const head = boundary > max * 0.5 ? cut.slice(0, boundary) : cut;
  return head.trimEnd().replace(/[、。]$/, '') + '…';
};

export const base = (l: Lang) => (l === 'ja' ? '/' : '/en/');
export const path = (l: Lang, p: string) => (l === 'ja' ? p : '/en' + p);
