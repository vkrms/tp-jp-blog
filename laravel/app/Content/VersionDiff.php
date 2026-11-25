<?php

namespace App\Content;

use App\Models\ArticleVersion;
use SebastianBergmann\Diff\Differ;
use SebastianBergmann\Diff\Output\UnifiedDiffOutputBuilder;

/** Line diff of two versions' content and sources, as pretty JSON. */
class VersionDiff
{
    /** @return array<int, array{type: string, text: string}> type: add | del | hunk | same */
    public static function lines(ArticleVersion $from, ArticleVersion $to): array
    {
        $differ = new Differ(new UnifiedDiffOutputBuilder("", addLineNumbers: false));
        $diff = $differ->diff(self::render($from), self::render($to));

        $lines = [];
        foreach (explode("\n", rtrim($diff, "\n")) as $line) {
            if (str_starts_with($line, '+++') || str_starts_with($line, '---')) {
                continue;
            }
            $lines[] = [
                'type' => match ($line[0] ?? ' ') { '+' => 'add', '-' => 'del', '@' => 'hunk', default => 'same' },
                'text' => $line,
            ];
        }

        return $lines;
    }

    private static function render(ArticleVersion $v): string
    {
        return json_encode(['sources' => $v->source_ids, ...$v->content],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n";
    }
}
