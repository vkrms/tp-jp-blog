<?php

namespace App\Filament\Resources\Articles\Pages;

use App\Console\Commands\ContentImport;
use App\Content\ArticlePublisher;
use App\Content\InvalidContent;
use App\Filament\Resources\Articles\ArticleResource;
use App\Models\Article;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Edit = card fields + a new content version, both through ArticlePublisher (validated, audited,
 * rebuild when live). Nothing is written directly from the form.
 */
class EditArticle extends EditRecord
{
    protected static string $resource = ArticleResource::class;

    public function getSubheading(): string|Htmlable|null
    {
        /** @var Article $a */
        $a = $this->record;

        return sprintf('%s · версия v%d · обновлена %s',
            ArticleResource::STATUS_LABELS[$a->status] ?? $a->status,
            $a->currentVersion?->version ?? 0,
            $a->content_updated_at?->toDateString() ?? '—');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('publish')->label('Опубликовать')->icon('heroicon-o-rocket-launch')->color('success')
                ->visible(fn (Article $record) => $record->status !== 'published')
                ->requiresConfirmation()
                ->modalDescription('Статья появится на сайте после пересборки.')
                ->action(fn (Article $record) => $this->run(fn () => app(ArticlePublisher::class)->publish($record), 'Статья опубликована')),
            Action::make('archive')->label('В архив')->icon('heroicon-o-archive-box')->color('danger')
                ->visible(fn (Article $record) => $record->status !== 'archived')
                ->requiresConfirmation()
                ->modalDescription('Статья пропадёт с сайта после пересборки. Вернуть — кнопкой «Опубликовать».')
                ->action(fn (Article $record) => $this->run(fn () => app(ArticlePublisher::class)->archive($record), 'Статья в архиве')),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $version = $this->record->currentVersion;
        $data['content_json'] = json_encode($version?->content ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $data['source_ids'] = $version?->source_ids ?? [];

        return $data;
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /** @var Article $record */
        $content = $this->decodeContent($data['content_json'] ?? '');
        $sources = array_values($data['source_ids'] ?? []);
        $note = filled($data['public_note_ja'] ?? null) ? ['ja' => $data['public_note_ja'], 'en' => $data['public_note_en'] ?? ''] : null;
        $current = $record->currentVersion;
        $contentChanged = $content !== ($current?->content ?? []) || $sources !== ($current?->source_ids ?? []) || $note;
        $publisher = app(ArticlePublisher::class);

        try {
            DB::transaction(function () use ($record, $data, $content, $sources, $note, $contentChanged, $publisher) {
                $publisher->updateCard($record, $data);
                if ($contentChanged) {
                    $publisher->saveVersion($record, $content, $sources, 'admin', $data['change_summary'] ?? null, $note);
                }
            });
        } catch (InvalidContent $e) {
            Notification::make()->danger()->title('Не сохранено: валидатор нашёл ошибки')
                ->body(implode("\n", array_slice($e->errors, 0, 8)))->persistent()->send();
            throw ValidationException::withMessages(['data.content_json' => $e->errors]);
        }

        return $record->refresh();
    }

    protected function afterSave(): void
    {
        $this->refreshFormData(['content_json', 'source_ids']);
        $this->form->fill([...$this->form->getRawState(), 'change_summary' => null, 'public_note_ja' => null, 'public_note_en' => null]);
    }

    /** JSON from the editor → content array with only the known content fields. */
    private function decodeContent(string $json): array
    {
        $content = json_decode($json, true);
        if (! is_array($content) || array_is_list($content)) {
            throw ValidationException::withMessages(['data.content_json' => 'Это не JSON-объект: '.(json_last_error_msg() ?: 'неверная структура')]);
        }
        $unknown = array_diff(array_keys($content), ContentImport::CONTENT_FIELDS);
        if ($unknown) {
            throw ValidationException::withMessages(['data.content_json' => 'Неизвестные поля: '.implode(', ', $unknown)]);
        }

        return $content;
    }

    private function run(callable $action, string $success): void
    {
        try {
            $action();
            Notification::make()->success()->title($success)->send();
        } catch (InvalidContent $e) {
            Notification::make()->danger()->title('Валидатор не пропустил статью')
                ->body(implode("\n", array_slice($e->errors, 0, 8)))->persistent()->send();
        }
        $this->record->refresh();
        $this->refreshFormData(['status']);
    }
}
