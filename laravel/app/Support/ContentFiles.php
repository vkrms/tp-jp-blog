<?php

namespace App\Support;

use RuntimeException;
use Symfony\Component\Yaml\Yaml;

/** Reads the repo-level content/ files and normalises their small format quirks. */
class ContentFiles
{
    public function __construct(private readonly string $path)
    {
        if (! is_dir($path)) {
            throw new RuntimeException("content folder not found: {$path}");
        }
    }

    public function json(string $file): array
    {
        return json_decode(file_get_contents($this->file($file)), true, flags: JSON_THROW_ON_ERROR);
    }

    public function yaml(string $file): array
    {
        return Yaml::parseFile($this->file($file));
    }

    private function file(string $file): string
    {
        $full = rtrim($this->path, '/').'/'.$file;
        if (! is_file($full)) {
            throw new RuntimeException("content file not found: {$full}");
        }

        return $full;
    }

    /** [ja, en] or {ja, en} → {ja, en}. */
    public static function pair(array $text): array
    {
        return array_is_list($text) ? ['ja' => $text[0] ?? '', 'en' => $text[1] ?? ''] : $text;
    }

    /** YYYY-MM-DD → itself; YYYY-MM → first of month; anything else (n/a, empty) → null. */
    public static function date(?string $value): ?string
    {
        if ($value && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }
        if ($value && preg_match('/^\d{4}-\d{2}$/', $value)) {
            return $value.'-01';
        }

        return null;
    }
}
