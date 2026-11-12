# Стадия 1: фронтенд на Astro, контент в репозитории, без админки

Версия: черновик 0.1, 2026-11-12. Цель: **деплой завтра.**
Стадия 2 (бэкенд Laravel + Filament, MySQL, агенты через OpenRouter) описана в `docs/spec.md` и в эту стадию не входит.

---

## 1. Что делаем и чего не делаем

**Делаем**
- Статический сайт на Astro: по одному URL на статью, JA (по умолчанию) и EN.
- Контент — 12 текущих статей, глоссарий, категории. Хранится в репозитории (§3).
- Дизайн — новая дизайн-система TP JP 3.0 (`docs/design.md`, `docs/design-tokens.css`).
- SEO: `title`, `description`, `canonical`, `hreflang`, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`.
- Деплой на Hostinger: сборка в GitHub Actions при пуше в `main`, заливка по SSH.

**Не делаем в стадии 1**
- Админку, базу данных, API, агентов, OpenRouter.
- Автоматическое обновление статей. Статьи правятся вручную, коммитом в репозиторий.
- Поиск и фильтры на JS. Всё, что нужно для первой версии, отдаётся статическим HTML.

**Как правятся статьи:** правка JSON-файла статьи (вручную или существующими скриптами `tools/*`) → `npm run check` → коммит в `main` → GitHub Actions собирает и деплоит сайт. Других шагов нет.

---

## 2. Структура репозитория

```
content/                     # контент — единственный источник правды
  articles.json              # 12 статей (одна статья = один файл — миграция §3.4)
  images/<slug>/*.jpg        # картинки статей
  categories.json
  glossary.json
  sources.json, facts.yaml, rules.json, queue.json, policy.yaml   # как сейчас, сайтом не используются
astro.config.mjs             # проект Astro лежит в корне репозитория
package.json                 # dev / build / preview / check
src/
  data/content.ts            # чтение content/ (в стадии 2 — из API)
  data/covers.ts, images.ts  # обложки карточек и картинки статей
  i18n/ui.ts                 # тексты интерфейса JA/EN (перенос из prototype/src/app.js → T)
  i18n/cta.ts                # внутристатейный CTA (slug → после какой секции и какой текст)
  styles/tokens.css          # копия docs/design-tokens.css (генерируется tools/build-design-tokens.mjs)
  styles/global.css          # стили компонентов на токенах
  styles/article.css         # стили шаблона статьи (только страницы статей)
  components/
    Header.astro, Footer.astro, ArticleCard.astro, Icon.astro, Mascot.astro
    article/  ArticleHeader, ArticleCover, AnswerBox, Toc, Faq, Matome,
              UpdateLog, EndStrip, RelatedArticles, ArticleSidebar, InPostCta
    blocks/   Paragraph, SubHeading, Figure, DataTable, Steps, CheckList,
              Say, Callout, Diff, BlockRenderer
    seo/      ArticleJsonLd.astro
tools/                       # существующие скрипты, переводятся на общий загрузчик (§3.4)
.github/workflows/deploy.yml
```

Astro лежит в корне репозитория, рядом с `content/`: `npm run check` и `node tools/validate.mjs` запускаются из корня, без отдельной папки фронтенда.

---

## 3. Формат хранения статей

### 3.1 Решение
**Одна статья — один JSON-файл** `content/articles/<slug>.json`. Внутри та же схема, что у элемента массива в нынешнем `content/articles.json`. Имя файла совпадает с `slug`.

Почему так, а не один общий файл и не Markdown:
- **Один файл на статью.** Правка одной статьи даёт маленький дифф, две параллельные правки разных статей не конфликтуют, откат одной статьи — `git revert` одного файла.
- **JSON, а не Markdown/MDX.** Статья — это структурированные блоки (`steps`, `table`, `say`, `point`, `warn`, `diff`, FAQ, `matome`) и пары JA/EN в каждом блоке. В Markdown это пришлось бы прятать в кастомные компоненты, а двуязычие — разносить по двум файлам, которые расходятся. Все существующие инструменты (`validate`, `edit-article`, `expand-article`, `article-stats`, `featured-image`) уже работают с этой JSON-структурой.
- **Совместимо со стадией 2.** В стадии 2 статьи переезжают в MySQL. В Astro меняется только загрузчик коллекции (файлы → API), компоненты и страницы остаются как есть.

### 3.2 Схема статьи (как сейчас, фиксируем)

Двуязычный текст (`Text`) — пара `[ja, en]` или объект `{ja, en}`. Сейчас в данных встречаются обе формы, и обе поддерживаются. Нормализацию к одной форме переносим на потом, чтобы не трогать контент накануне релиза.

| Поле | Тип | Обязательно | На сайте |
|---|---|---|---|
| `slug` | string, `a-z0-9-`, = имя файла | да | URL |
| `category` | id из `categories.json` | да | бейдж, хлебные крошки |
| `level` | 0 \| 1 (初級/中級) | да | метка уровня |
| `read_minutes` | number | да | «N分で読めます» |
| `keyword` | string | да | нет (для SEO-работы) |
| `title` | Text | да | `h1`, `<title>` |
| `eyebrow` | Text | да | надзаголовок, карточка |
| `answer_first` | Text (с `**жирным**`) | да | блок «この記事の要点», `meta description` |
| `sections[]` | `{ h: Text, b: Block[] }` | да | тело статьи, оглавление |
| `faq[]` | `[Text, Text]` (вопрос, ответ) | да, 2–5 | FAQ + JSON-LD `FAQPage` |
| `matome[]` | Text[] | да | «まとめ» |
| `sources[]` | id из `sources.json` | да | **нет** (правило `agents/rules.md`) |
| `related[]` | slug[] | нет | «あわせて読みたい» |
| `updated_at` | `YYYY-MM-DD` | да | дата обновления, `dateModified` |
| `update_log[]` | `{date, public: Text, internal_note: Text}` | да | «更新履歴» — **только `public`** |
| `review_status` | string | нет | нет |
| `icon` | имя иконки | да | карточка |

**Блоки (`sections[].b[]`)** — объект с одним ключом:

| Ключ | Значение | Компонент |
|---|---|---|
| `p` | Text | абзац |
| `h3` | Text | подзаголовок |
| `img` | `{src, alt: Text, caption: Text, prompt_scene?}` | картинка с подписью (`src` относительно `content/`) |
| `table` | `{head: Text[], rows: Text[][]}` | таблица с горизонтальной прокруткой на мобильных |
| `steps` | Text[] | нумерованные шаги |
| `list` | Text[] | чек-лист |
| `say` | Text | реплика маскота |
| `point` | `[Text заголовок, Text текст]` | блок «ポイント» |
| `warn` | `[Text заголовок, Text текст]` | блок «注意» |
| `diff` | `[Text было, Text стало]` | «更新前 / 更新後» |

Неизвестный ключ блока ломает сборку: схема Zod падает с понятной ошибкой.

**Не выводится на сайт никогда:** `update_log[].internal_note`, `img.prompt_scene`, `sources`, `keyword`, `review_status`.

### 3.3 Валидация
- **Схема Zod** в `src/content.config.ts`. Неверная структура — сборка не проходит, деплоя нет.
- **`tools/validate.mjs`** (запрещённые формулировки, исключённые темы, служебный текст) — переводится на чтение `content/articles/*.json`. Проверку `prototype/index.html` из него убираем, прототип больше не деплоится.
- `npm run check` = `node tools/validate.mjs && astro check && astro build`. Этот же шаг выполняется в CI до деплоя.

### 3.4 Миграция (делаем сегодня)
1. `tools/lib/articles.mjs` — общий загрузчик: `loadArticles()` читает `content/articles/*.json`, `saveArticle(a)` пишет один файл (JSON с отступом 1, как сейчас, перевод строки в конце).
2. Одноразовый скрипт разбивает `content/articles.json` на 12 файлов и удаляет общий файл.
3. Скрипты `validate`, `edit-article`, `expand-article`, `article-stats`, `preview-article`, `restore-backup`, `sync-prototype`, `featured-image/generate` переводятся на `tools/lib/articles.mjs`.
4. Проверка: `node tools/validate.mjs` даёт «12 статей, 0 ошибок», как и до миграции.

**Запасной вариант, если миграция не успевает:** Astro читает нынешний `content/articles.json` через загрузчик `file()`. Компоненты и страницы от этого не меняются, разбиение на файлы делается после релиза.

### 3.5 Прочие коллекции
- `categories.json` — `{id, t: [ja,en], c: цвет}`. Цвет категории приводим к токенам дизайн-системы при вёрстке.
- `glossary.json` — `{term_ja, term_en, def_ja, def_en, kind: "gen"|"tp"}`.
- Тексты интерфейса (меню, кнопки, футер, главная, «О сайте») — не контент, а код: `src/i18n/ui.ts`, перенос из объекта `T` в `prototype/src/app.js`. Внутренние строки прототипа (`banner`, `plan*`, `srcN`, `statNote`, `promo`, `pendT`) не переносятся.

---

## 4. Astro: конфигурация

- Актуальная стабильная версия Astro на дату старта, `output: 'static'`.
- **Коллекции** (content layer): `articles` — загрузчик `glob({ pattern: '*.json', base: '../content/articles' })`; `categories` и `glossary` — загрузчик `file()`.
- **i18n**: `defaultLocale: 'ja'`, `locales: ['ja', 'en']`, `routing.prefixDefaultLocale: false`. JA живёт в корне, EN — под `/en/`.
- **`site`** берётся из переменной окружения `SITE_URL`. Пока нет домена, это временный домен Hostinger. От `site` зависят `canonical`, `hreflang` и sitemap, поэтому при смене домена нужна пересборка.
- **`trailingSlash: 'always'`**, `build.format: 'directory'` → `/articles/<slug>/index.html`.
- **Интеграции:** `@astrojs/sitemap` (с i18n, чтобы в sitemap были альтернативные языки).
- **Картинки:** `astro:assets` (`<Image>` → webp, `srcset`, `width/height`, lazy). Пути `img.src` разрешаются относительно `content/`. Если `image()`-хелпер схемы не заработает для JSON-коллекции из внешней папки, картинки копируются в `public/images/` на этапе `prebuild` и выводятся обычным `<img>` с `width/height`.
- **Шрифт:** Noto Sans JP (400/500/700), подключение из `tokens.css`. Если успеваем — self-host через `@fontsource`, чтобы не зависеть от Google Fonts.
- **JS на клиенте:** нет, кроме нативных `<details>` (оглавление, FAQ).

---

## 5. Страницы и URL

| Страница | JA | EN |
|---|---|---|
| Главная | `/` | `/en/` |
| Все статьи (сгруппированы по категориям) | `/articles/` | `/en/articles/` |
| Статья | `/articles/<slug>/` | `/en/articles/<slug>/` |
| Глоссарий | `/glossary/` | `/en/glossary/` |
| О сайте | `/about/` | `/en/about/` |
| Политика конфиденциальности | `/privacy/` | `/en/privacy/` |
| Контакты | `/contact/` | `/en/contact/` |
| 404 | `/404.html` | — |

Отдельных страниц категорий в стадии 1 нет. Чтобы не было тонких страниц по 1–2 статьи, категории — разделы на `/articles/` с якорями (`/articles/#seo`).

**Статья (порядок, как в прототипе и `agents/rules.md`):** хлебные крошки → категория и уровень → `h1` → дата обновления и время чтения → «この記事の要点» (`answer_first`) → оглавление → секции → FAQ → ◇ ◇ ◇ → まとめ → 更新履歴 (только `public`) → «あわせて読みたい» → CTA.
- Внутристатейный CTA (`CTAIN` из прототипа) переносится в `src/i18n/cta.ts` (slug → после какой секции и какой текст).
- Подпись — «ラボ編集部». Блока «источники» нет. Пометки «содержит промо» нет (правило `agents/rules.md`).
- Виджет «Было полезно?» из прототипа в стадию 1 не входит: ему нужен бэкенд.

**Главная:** hero (тексты `heroH`, `heroP`, кнопки), новые статьи (6 карточек, порядок — по `updated_at`), три числа Travelpayouts (только утверждённые: 11 вертикалей, Support 24/7 / 26 минут, выплаты до 20-го), категории, термины глоссария, CTA.

**Ссылки регистрации:** константа `KEY = https://landings.travelpayouts.com/?tp_place=landing_jp-seo-blog`. Для аналитики можно добавить суффиксы к `tp_place` (`_hero`, `_inpost`, `_footer`) — подтвердить с маркетингом, по умолчанию без суффиксов.

**Переключатель языка:** ссылка на ту же страницу во втором языке (`/articles/x/` ↔ `/en/articles/x/`). Без localStorage и без автоматического редиректа по языку браузера.

---

## 6. SEO

На каждой странице через `Head.astro`:
- `<html lang="ja|en">`, `<title>` (статья: `title` + « | 旅アフィリ・ラボ»), `meta description` (статья: `answer_first` без `**`, до ~120 знаков JA / ~155 EN).
- `canonical` — абсолютный URL самой страницы.
- `hreflang`: `ja`, `en`, `x-default` (→ JA).
- Open Graph и Twitter: `og:type=article` для статей, `og:locale` `ja_JP` / `en_US`. `og:image` — одна общая картинка сайта, пока у статей нет обложек (обложки — после релиза, `tools/featured-image`).
- JSON-LD: `Article` (`headline`, `datePublished` = первая дата `update_log`, `dateModified` = `updated_at`, `author`/`publisher` = Travelpayouts / ラボ編集部), `FAQPage`, `BreadcrumbList`. На главной — `WebSite` и `Organization`.
- `sitemap.xml` с альтернативами языков, `robots.txt` со ссылкой на sitemap.
- **Пока сайт на временном домене Hostinger — `noindex` и `Disallow: /`** (переменная `INDEXING=false`). Индексацию включаем одной переменной, когда подключён боевой домен. Иначе Google проиндексирует временный адрес, и придётся переезжать.

---

## 7. Дизайн

- Токены — `docs/design-tokens.css` (генерируется из `docs/design.md`, руками не правится). В `src/styles/` это копия, обновляется тем же скриптом `tools/build-design-tokens.mjs`.
- Компоненты статьи собираются на токенах. За основу берём стили `tools/preview-article.mjs`: они уже на новых токенах и покрывают `p`, `h3`, `img`, `table`, `point`, `steps`, `list`, `diff`, FAQ, `matome`. Дописываем `say`, `warn`, шапку, футер, карточки, hero, CTA.
- Структура главной и шапки — из прототипа (`prototype/src/app.js`, `head.html`), визуальные решения — из `docs/design.md` (плоская система, одна синяя для действий, оранжевый — для «無料» и поддержки, радиусы и отступы из токенов).
- Маскот Tabi (SVG из прототипа) переносится в `Mascot.astro`.
- Адаптив: десктоп 1440, мобильный 375 (контейнер 343, отступ 16), как в `docs/design.md`.
- Ориентир — Lighthouse ≥ 90 по Performance, Accessibility, SEO на мобильном. Это цель, а не блокер релиза.

---

## 8. Деплой

**`.github/workflows/deploy.yml`** (заменяет шаблоны `update.yml`/`write.yml` из прошлой версии проекта — в стадии 1 агентов нет; `validate.yml` поглощается этим workflow):
1. Триггер: `push` в `main` (контент и код в одном репозитории, поэтому пуш = обновление сайта) + `workflow_dispatch`.
2. `concurrency: { group: deploy, cancel-in-progress: true }`.
3. `npm ci` → `npm run check` (валидатор + `astro check` + `astro build`). Упала проверка — деплоя нет, на сайте остаётся прошлая версия.
4. `rsync -az --delete dist/ user@host:<docroot>/` по SSH-ключу из GitHub Secrets (`DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`). Атомарные релизы через симлинк (как в `docs/spec.md` §11.2) — после релиза. Для первой версии хватит `rsync`.
5. Переменные сборки: `SITE_URL`, `INDEXING`.

В стадии 1 бэкенду не нужен GitHub-токен: пересборку запускает сам коммит.

**Где живёт репозиторий.** На старте — приватный репозиторий в **личном аккаунте GitHub разработчика** (согласование с девопсами отнимает время). Следствия:
- Минуты Actions идут из лимита личного аккаунта: 2000 мин/мес для приватных репозиториев на Free. Одна сборка ≈ 2 мин, при ручных правках это десятки минут в месяц.
- Секреты `DEPLOY_*` (SSH-ключ к хостингу компании) хранятся в личном аккаунте. Ключ выпускается отдельно под деплой, с доступом только к папке сайта, чтобы его можно было отозвать, не затрагивая остальное.
- **Переезд в организацию** позже: Settings → Transfer ownership. История, issues и workflows переезжают, **секреты — нет**, их нужно завести заново в новом репозитории. Ссылки на старый адрес GitHub перенаправляет автоматически.
- Доступ клиенту и коллегам — через collaborators личного репозитория.

**Запасной путь на завтра** (если GitHub Actions или SSH-ключ не согласованы вовремя): `npm run build` локально и заливка `dist/` через SFTP или файловый менеджер Hostinger. Результат тот же, просто вручную.

**Hostinger:** document root временного домена указывает на папку, куда идёт `rsync`. `.htaccess`: HTTPS-редирект, `ErrorDocument 404 /404.html`, кэш для `/_astro/*` (имена с хешем, можно `immutable` на год), короткий кэш для HTML.

---

## 9. План работ (сегодня → завтра)

| # | Задача | Результат |
|---|---|---|
| 1 | Миграция контента на `content/articles/*.json` + общий загрузчик + перевод `tools/*` (§3.4) | `validate` = 12 статей, 0 ошибок |
| 2 | Скелет Astro в корне репозитория: конфиг, i18n, коллекции со схемой Zod | `astro build` проходит на реальном контенте |
| 3 | Компоненты блоков и страница статьи (JA/EN) | 24 страницы статей |
| 4 | Шапка, футер, главная, список статей, глоссарий, «О сайте», privacy, contact, 404 | все страницы из §5 |
| 5 | SEO: Head, JSON-LD, sitemap, robots, noindex-режим | проверка Rich Results на 1–2 статьях |
| 6 | `deploy.yml` + `.htaccess` | деплой на временный домен |
| 7 | Проверка: мобильный и десктоп, оба языка, все 12 статей, ссылки регистрации, 404 | релиз |

---

## 10. Блокеры и что нужно от людей

1. **Новый сайт на Hostinger — попросить девопсов сегодня (2026-11-12).** Временный домен, SSH-доступ для деплоя по ключу, путь к document root. Без этого завтра возможна только локальная сборка. Нужен к шагу 6.
2. **Секреты в GitHub** (`DEPLOY_*`) — заводит разработчик в своём личном репозитории (§8), после того как девопсы выдадут SSH-доступ.
3. **Почта для «Контактов»** — нужен реальный адрес.
4. **Тексты «Политики конфиденциальности»** — по README их согласуют юристы. Пока сайт закрыт от индексации, можно выложить черновик с пометкой. Публичный запуск — только с согласованным текстом.
5. **Боевой домен** — до включения индексации (§6).
6. **Аналитика** (GA4 / GTM / другое) — нужен ли счётчик в стадии 1. Если да, то какой ID и нужен ли баннер cookie: это влияет на текст политики конфиденциальности.

---

## 11. Переход к стадии 2

- Страницы, компоненты и схема статьи не меняются.
- Коллекция `articles` переключается с `glob()` (файлы) на загрузчик из API бэкенда (`docs/spec.md` §8.1).
- Триггер деплоя меняется с `push` на `repository_dispatch` от бэкенда (`docs/spec.md` §11.2).
- Файлы `content/articles/*.json` становятся источником для разового импорта в MySQL (`docs/spec.md` §10). Импорт упрощается: формат уже один файл = одна статья.
