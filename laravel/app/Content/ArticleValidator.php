<?php

namespace App\Content;

use App\Models\Article;
use App\Models\Source;
use App\Support\ContentFiles;

/**
 * Content validator (docs/spec.md §6). Port of tools/validate.mjs plus structural checks.
 * Works on the stage-1 article array (ArticlePayload::full), so the same rules apply to
 * imported content, agent output and admin edits.
 *
 * It checks form, not truth: forbidden wording, excluded topics, structure, references.
 */
class ArticleValidator
{
    public const BLOCK_TYPES = ['p', 'h3', 'img', 'table', 'steps', 'list', 'say', 'point', 'warn', 'diff'];

    private const SERVICE_TEXT_PUBLIC_LOG = '/未確認|未了|公開前|試作|prototype|draft/iu';
    private const SERVICE_TEXT_BODY = '/試作版|ネイティブチェック|下書き|公開前に、?(確認します|一次|照合)/u';
    private const JSON_FLAGS = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;

    /** @var string[] */
    private readonly array $sourceIds;

    /** @var string[] */
    private readonly array $slugs;

    /** @var array<string, true> hosts of http(s) sources: the only hosts article links may point to */
    private readonly array $sourceHosts;

    /**
     * @param  array  $rules  content/rules.json
     * @param  array<string, string>  $sources  registered sources: id => url
     * @param  array<string, ?string>  $keywords  all articles: slug => keyword (for `related` and duplicate keywords)
     */
    public function __construct(
        private readonly array $rules,
        private readonly array $sources,
        private readonly array $keywords,
    ) {
        $this->sourceIds = array_map('strval', array_keys($sources));
        $this->slugs = array_map('strval', array_keys($keywords));
        $hosts = [];
        foreach ($sources as $url) {
            if ($host = self::host($url)) {
                $hosts[$host] = true;
            }
        }
        $this->sourceHosts = $hosts;
    }

    /** Validator over the current database state and content/rules.json. */
    public static function fromDatabase(): self
    {
        return new self(
            (new ContentFiles(config('content.path')))->json('rules.json'),
            Source::pluck('url', 'id')->all(),
            Article::pluck('keyword', 'slug')->all(),
        );
    }

    /** @return array{errors: string[], warnings: string[]} */
    public function validate(array $a): array
    {
        $errors = [];
        $warnings = [];
        $e = function (string $m) use (&$errors) { $errors[] = $m; };
        $w = function (string $m) use (&$warnings) { $warnings[] = $m; };

        // --- ported from tools/validate.mjs -------------------------------------------------
        foreach ($this->rules['required_fields'] as $f) {
            $v = $a[$f] ?? null;
            if ($v === null || (is_array($v) && $v === [] && $f !== 'sources')) {
                $e("нет поля {$f}");
            }
        }
        foreach ($a['sources'] ?? [] as $s) {
            if (! in_array($s, $this->sourceIds, true)) {
                $e("источник {$s} не в реестре");
            }
        }
        $faq = count($a['faq'] ?? []);
        if ($faq < $this->rules['faq_min'] || $faq > $this->rules['faq_max']) {
            $w("FAQ: {$faq} (нужно {$this->rules['faq_min']}-{$this->rules['faq_max']})");
        }
        $answerJa = is_array($a['answer_first'] ?? null) ? Text::ja($a['answer_first']) : null;
        $max = $this->rules['answer_first_max_chars_ja'];
        if ($answerJa !== null && mb_strlen(str_replace('**', '', $answerJa)) > $max) {
            $w("ответ в начале длиннее {$max} знаков");
        }

        $text = json_encode([$a['title'] ?? null, $a['answer_first'] ?? null, $a['sections'] ?? null, $a['faq'] ?? null, $a['matome'] ?? null], self::JSON_FLAGS);
        foreach ($this->rules['forbidden_everywhere'] as $r) {
            if (self::matches($r['pattern'], $text)) {
                $e("запрещено «{$r['pattern']}»: {$r['why']}");
            }
        }
        foreach ($this->rules['forbidden_except'] as $r) {
            if (! in_array($a['slug'] ?? null, $r['allow_slugs'], true) && self::matches($r['pattern'], $text)) {
                $e("«{$r['pattern']}» вне списка разрешённых статей: {$r['why']}");
            }
        }
        if (empty($a['update_log'])) {
            $e('нет update_log');
        }
        foreach ($a['update_log'] ?? [] as $l) {
            if (preg_match(self::SERVICE_TEXT_PUBLIC_LOG, json_encode($l['public'] ?? null, self::JSON_FLAGS))) {
                $e('в публичной строке update_log есть служебный текст');
            }
        }
        if (preg_match(self::SERVICE_TEXT_BODY, $text)) {
            $e('в тексте статьи есть служебная формулировка (試作版 / ネイティブチェック / 下書き / 公開前に…確認します)');
        }
        foreach ($this->rules['excluded_topics']['patterns'] as $p) {
            if (preg_match(self::regex($p), $text, $m)) {
                $e("исключённая тема (право/налоги/условия ASP): «{$m[0]}»");
            }
        }

        // --- structural checks (docs/spec.md §6 «Добавляется») ---------------------------------
        $slug = $a['slug'] ?? '';
        if (! preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) {
            $e("slug «{$slug}»: только a-z, 0-9 и дефисы");
        } elseif ($slug === 'en') {
            $e('slug «en» зарезервирован (английская версия страницы = её адрес + en/)');
        }
        foreach ($a['related'] ?? [] as $r) {
            if ($r === $slug) {
                $e('related ссылается на саму статью');
            } elseif (! in_array($r, $this->slugs, true)) {
                $e("related: статьи {$r} нет");
            }
        }
        $this->checkSeo($a, $e, $w);
        $this->checkSourceLinks($a, $e, $w);

        foreach ($this->texts($a) as [$path, $value]) {
            if (! Text::isComplete($value, allowBlank: str_contains($path, '.table.'))) {
                $e("{$path}: нужен текст на обоих языках (ja и en)");
            }
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Every bilingual text of the article with its path, walking the known schema
     * (docs/spec-stage1.md §3.2). Unknown or malformed blocks are reported as texts that fail.
     *
     * @return iterable<array{0: string, 1: mixed}>
     */
    private function texts(array $a): iterable
    {
        foreach (['title', 'eyebrow', 'answer_first'] as $f) {
            yield [$f, $a[$f] ?? null];
        }
        foreach ($a['sections'] ?? [] as $i => $s) {
            yield ["sections[{$i}].h", $s['h'] ?? null];
            foreach ($s['b'] ?? [] as $j => $block) {
                $at = "sections[{$i}].b[{$j}]";
                if (! is_array($block) || count($block) !== 1 || ! in_array(array_key_first($block), self::BLOCK_TYPES, true)) {
                    yield ["{$at} (неизвестный блок: ".implode(',', is_array($block) ? array_keys($block) : ['?']).')', null];

                    continue;
                }
                $type = array_key_first($block);
                $v = $block[$type];
                $at .= ".{$type}";
                yield from match ($type) {
                    'p', 'h3', 'say' => [[$at, $v]],
                    'steps', 'list' => self::each($at, $v),
                    'point', 'warn', 'diff' => self::each($at, $v, 2),
                    'img' => [["{$at}.alt", $v['alt'] ?? null], ["{$at}.caption", $v['caption'] ?? null]],
                    'table' => [...self::each("{$at}.head", $v['head'] ?? null),
                        ...collect($v['rows'] ?? [])->flatMap(fn ($row, $r) => self::each("{$at}.rows[{$r}]", $row))->all()],
                };
            }
        }
        foreach ($a['faq'] ?? [] as $i => $qa) {
            yield from self::each("faq[{$i}]", $qa, 2);
        }
        yield from self::each('matome', $a['matome'] ?? []);
    }

    /** agents/seo-ja.md §3, §5, §9: title length, related count, one keyword per article. */
    private function checkSeo(array $a, callable $e, callable $w): void
    {
        $seo = $this->rules['seo'] ?? null;
        if (! $seo) {
            return;
        }
        $title = is_array($a['title'] ?? null) ? (Text::ja($a['title']) ?? '') : '';
        $len = mb_strlen($title);
        if ($len > $seo['title_max_chars_ja']) {
            $w("title {$len} знаков (нужно до {$seo['title_max_chars_ja']})");
        }
        $related = count($a['related'] ?? []);
        if ($related < $seo['related_min'] || $related > $seo['related_max']) {
            $w("related: {$related} (нужно {$seo['related_min']}-{$seo['related_max']})");
        }
        $keyword = trim((string) ($a['keyword'] ?? ''));
        if ($keyword !== '' && ($seo['unique_keyword'] ?? false)) {
            foreach ($this->keywords as $slug => $other) {
                if ($slug !== ($a['slug'] ?? null) && trim((string) $other) === $keyword) {
                    $w("ключ «{$keyword}» уже у статьи {$slug} (каннибализация)");
                    break;
                }
            }
        }
    }

    /**
     * agents/seo-ja.md §6, §9: inline [anchor](url) links point to https pages on registered source hosts,
     * not to a site's homepage, with a descriptive anchor; every http(s) source of the article is linked.
     */
    private function checkSourceLinks(array $a, callable $e, callable $w): void
    {
        $cfg = $this->rules['source_links'] ?? null;
        if (! $cfg) {
            return;
        }
        $strings = [];
        $collect = function ($v) use (&$collect, &$strings) {
            if (is_string($v)) {
                $strings[] = $v;
            } elseif (is_array($v)) {
                foreach ($v as $x) {
                    $collect($x);
                }
            }
        };
        $collect([$a['answer_first'] ?? null, $a['sections'] ?? null, $a['faq'] ?? null, $a['matome'] ?? null]);

        $pattern = '/'.str_replace('/', '\/', $cfg['link_pattern']).'/u';
        $badAnchors = array_map(fn ($b) => mb_strtolower($b), $cfg['bad_anchors'] ?? []);
        $linked = [];
        foreach ($strings as $str) {
            preg_match_all($pattern, $str, $m, PREG_SET_ORDER);
            foreach ($m as [, $text, $url]) {
                if (! str_starts_with($url, 'https://')) {
                    $e("ссылка «{$text}»: адрес не https ({$url})");
                } elseif (! isset($this->sourceHosts[self::host($url) ?? ''])) {
                    $e("ссылка «{$text}»: хоста ".self::host($url).' нет в реестре источников');
                } elseif (strlen((string) parse_url($url, PHP_URL_PATH)) <= 1) {
                    $w("ссылка «{$text}» ведёт на главную страницу, нужна конкретная страница источника");
                }
                if (in_array(mb_strtolower(trim($text)), $badAnchors, true)) {
                    $e("анкор «{$text}» запрещён (нужно описание факта или название источника)");
                }
                $linked[self::normUrl($url)] = true;
            }
        }

        $report = ($cfg['enforce'] ?? false) ? $e : $w;
        foreach ($a['sources'] ?? [] as $id) {
            $url = $this->sources[$id] ?? null;
            if ($url && preg_match('/^https?:/', $url) && ! isset($linked[self::normUrl($url)])) {
                $report("источник «{$id}» из sources не привязан ссылкой к тексту статьи");
            }
        }
    }

    /** host[:port] like JavaScript's URL.host; null for non-URLs (e.g. internal: sources). */
    private static function host(?string $url): ?string
    {
        $parts = $url ? parse_url($url) : false;
        if (! $parts || empty($parts['host']) || ! preg_match('/^https?$/', $parts['scheme'] ?? '')) {
            return null;
        }

        return $parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '');
    }

    /** Same page regardless of #fragment and trailing slash. */
    private static function normUrl(string $url): string
    {
        return rtrim(preg_replace('/#.*$/', '', $url), '/');
    }

    /** Items of a list of texts; with $size, the list must have exactly that many items. */
    private static function each(string $at, mixed $list, ?int $size = null): array
    {
        if (! is_array($list) || ! array_is_list($list) || ($size !== null && count($list) !== $size)) {
            return [["{$at} (неверная структура)", null]];
        }

        return array_map(fn ($v, $i) => ["{$at}[{$i}]", $v], $list, array_keys($list));
    }

    private static function matches(string $pattern, string $text): bool
    {
        return (bool) preg_match(self::regex($pattern), $text);
    }

    /** rules.json patterns are JavaScript regex sources; they compile as PCRE with the u flag. */
    private static function regex(string $pattern): string
    {
        return '/'.str_replace('/', '\/', $pattern).'/u';
    }
}
