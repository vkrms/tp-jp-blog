<?php

namespace App\Content;

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

    /**
     * @param  array  $rules  content/rules.json
     * @param  string[]  $sourceIds  registered source ids
     * @param  string[]  $slugs  all existing article slugs (for `related`)
     */
    public function __construct(
        private readonly array $rules,
        private readonly array $sourceIds,
        private readonly array $slugs,
    ) {}

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
        }
        foreach ($a['related'] ?? [] as $r) {
            if ($r === $slug) {
                $e('related ссылается на саму статью');
            } elseif (! in_array($r, $this->slugs, true)) {
                $e("related: статьи {$r} нет");
            }
        }
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
