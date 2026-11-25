<?php

namespace App\Content;

/** Bilingual content text: [ja, en] or {ja, en} (both forms exist in stage-1 content). */
class Text
{
    public static function ja(array $text): ?string
    {
        return array_is_list($text) ? ($text[0] ?? null) : ($text['ja'] ?? null);
    }

    public static function en(array $text): ?string
    {
        return array_is_list($text) ? ($text[1] ?? null) : ($text['en'] ?? null);
    }

    /**
     * A text with a non-empty string for both ja and en. With $allowBlank, a text that is empty
     * in both languages also passes (e.g. an empty corner cell of a table); one-sided is never OK.
     */
    public static function isComplete(mixed $text, bool $allowBlank = false): bool
    {
        if (! is_array($text) || (array_is_list($text) && count($text) !== 2)) {
            return false;
        }
        $values = [self::ja($text), self::en($text)];
        foreach ($values as $v) {
            if (! is_string($v)) {
                return false;
            }
        }
        $filled = array_filter($values, fn ($v) => trim($v) !== '');

        return count($filled) === 2 || ($allowBlank && $filled === []);
    }
}
