<?php

namespace App\Console\Commands;

use App\Content\ArticlePayload;
use App\Content\ArticleValidator;
use App\Models\Article;
use App\Models\Source;
use App\Support\ContentFiles;
use Illuminate\Console\Command;

/** Validate every article in the database (docs/spec.md §6). Exit code 1 on errors. */
class ContentValidate extends Command
{
    protected $signature = 'content:validate {--status= : only articles with this status}';

    protected $description = 'Validate article content against content/rules.json and the article schema';

    public function handle(): int
    {
        $articles = Article::with(['currentVersion', 'updateLog'])
            ->when($this->option('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderBy('id')->get();

        $validator = ArticleValidator::fromDatabase();

        $errors = [];
        $warnings = [];
        foreach ($articles as $article) {
            $result = $validator->validate(ArticlePayload::full($article));
            foreach ($result['errors'] as $m) {
                $errors[] = "{$article->slug}: {$m}";
            }
            foreach ($result['warnings'] as $m) {
                $warnings[] = "{$article->slug}: {$m}";
            }
        }

        $this->line(sprintf('Статей: %d. Ошибок: %d. Предупреждений: %d', $articles->count(), count($errors), count($warnings)));
        foreach ($errors as $m) {
            $this->line("ERROR  {$m}");
        }
        foreach ($warnings as $m) {
            $this->line("WARN   {$m}");
        }

        return $errors ? self::FAILURE : self::SUCCESS;
    }
}
