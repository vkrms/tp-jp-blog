// Snowplow `page_view` for the JP SEO blog — one `pv` per document load.
// Reference: docs (snowplow-pageview-spec.md), originally tp-eleven/src/analytics.js.
//
// The tracker is loaded with a dynamic import so it stays off the critical path. One `pv` per
// document load; `startAnalytics()` is idempotent.

import { SITE_CATEGORY } from '../config';

const COLLECTOR = 'https://avsplow.com';
const APP_ID = 'tp_marketing';
const NAMESPACE = 'sp';
const PARENT_DOMAIN = 'travelpayouts.com';

// v4 expects `cookieLifetime` in SECONDS (default is 2 years). Keep the policy value in days and
// convert once, at the tracker boundary.
const COOKIE_DAYS = 30;
const COOKIE_LIFETIME_SECONDS = COOKIE_DAYS * 24 * 60 * 60;

// PII stripped from the page URL and referrer before the tracker reads them. Extend for this site.
const PRIVATE_PARAMS = ['email'];

const asInteger = (raw: unknown): number | null => {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const n = parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// Resolved-but-empty values must not reach the payload: the event-sheet columns expect null.
const nonEmpty = (v: string | null): string | null => (v === null || v === '' ? null : v);

const cookie = (name: string): string | null => {
  const pair = document.cookie
    .split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith(name + '='));
  if (pair === undefined) return null;
  try {
    return decodeURIComponent(pair.slice(name.length + 1));
  } catch {
    return null;
  }
};

const redact = (url: string): string => {
  if (!url) return '';
  try {
    const u = new URL(url, location.href);
    PRIVATE_PARAMS.forEach((name) => u.searchParams.delete(name));
    return u.toString();
  } catch {
    // Unparseable URL: keep origin + pathname, drop the query and hash.
    return location.origin + location.pathname;
  }
};

interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  promotion_code_id: number | null;
  referral_marker: number | null;
  ad_source: string | null;
  ad_content: string | null;
  tp_referrer: string | null;
}

// Cookie wins over the current query string (last-touch attribution), else null so the event-sheet
// columns stay aligned. Empty values are folded to null (the spec forbids empty strings).
const attribution = (): Attribution => {
  const q = new URLSearchParams(location.search);
  const utm = (name: string) => nonEmpty(cookie(name)) ?? nonEmpty(q.get(name));
  return {
    utm_source: utm('utm_source'),
    utm_medium: utm('utm_medium'),
    utm_campaign: utm('utm_campaign'),
    utm_term: utm('utm_term'),
    utm_content: utm('utm_content'),
    promotion_code_id: asInteger(q.get('promotion_code')),
    referral_marker: asInteger(cookie('marker')),
    ad_source: nonEmpty(cookie('ad_source')),
    ad_content: nonEmpty(cookie('ad_content')),
    tp_referrer: nonEmpty(cookie('tp_referrer')),
  };
};

interface ContextEntity {
  schema: string;
  data: Record<string, unknown>;
}

// The custom entity is identified by the literal `schema: "event"` — an Iglu URI is wrong here.
const eventEntity = (): ContextEntity => ({
  schema: 'event',
  data: {
    category: SITE_CATEGORY,
    action: 'page_view',
    attr_parameters: attribution(),
    marker: asInteger(cookie('partners_marker')),
  },
});

// Share the visitor id across *.travelpayouts.com; host-only everywhere else (localhost, previews).
const cookieDomain = (): string | undefined => {
  const host = location.hostname;
  return host === PARENT_DOMAIN || host.endsWith('.' + PARENT_DOMAIN) ? '.' + PARENT_DOMAIN : undefined;
};

async function init(): Promise<void> {
  const api = await import('@snowplow/browser-tracker');
  api.newTracker(NAMESPACE, COLLECTOR, {
    appId: APP_ID,
    cookieDomain: cookieDomain(),
    cookieLifetime: COOKIE_LIFETIME_SECONDS,
  });
  // `trackPageView` reads location.href and document.referrer itself, so the redacted values
  // must be set first.
  api.setCustomUrl(redact(location.href));
  const referrer = redact(document.referrer);
  if (referrer) api.setReferrerUrl(referrer);
  api.trackPageView({ title: document.title, context: [eventEntity()] });
}

let started = false;

export function startAnalytics(): void {
  if (started) return;
  started = true;
  // Analytics must never break the page.
  init().catch(() => {});
}

startAnalytics();
