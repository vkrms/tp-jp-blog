<?php

namespace App\Filament\Resources\Articles\RelationManagers;

use App\Content\ArticlePublisher;
use App\Content\VersionDiff;
use App\Filament\Resources\Articles\ArticleResource;
use App\Models\Article;
use App\Models\ArticleVersion;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

/** Read-only version history: diff against the current version, roll back (docs/spec.md §9). */
class VersionsRelationManager extends RelationManager
{
    protected static string $relationship = 'versions';
    protected static ?string $title = 'Версии';

    public function isReadOnly(): bool
    {
        return false; // allow the row actions; there is still no create/edit/delete
    }

    public function table(Table $table): Table
    {
        /** @var Article $article */
        $article = $this->getOwnerRecord();

        return $table
            ->defaultSort('version', 'desc')
            ->columns([
                TextColumn::make('version')->label('Версия')->prefix('v'),
                IconColumn::make('current')->label('Текущая')->boolean()
                    ->state(fn (ArticleVersion $r) => $r->id === $article->current_version_id),
                TextColumn::make('author')->label('Автор')->badge(),
                TextColumn::make('change_summary')->label('Изменения')->wrap()->placeholder('—'),
                TextColumn::make('created_at')->label('Создана')->dateTime('Y-m-d H:i'),
            ])
            ->recordActions([
                Action::make('diff')->label('Сравнить с текущей')->icon('heroicon-o-arrows-right-left')
                    ->visible(fn (ArticleVersion $r) => $r->id !== $article->current_version_id)
                    ->modalHeading(fn (ArticleVersion $r) => "v{$r->version} → v{$article->currentVersion->version} (текущая)")
                    ->modalContent(fn (ArticleVersion $r) => view('filament.version-diff', ['lines' => VersionDiff::lines($r, $article->currentVersion)]))
                    ->modalWidth('7xl')
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Закрыть'),
                Action::make('rollback')->label('Откатить к этой')->icon('heroicon-o-arrow-uturn-left')->color('warning')
                    ->visible(fn (ArticleVersion $r) => $r->id !== $article->current_version_id)
                    ->requiresConfirmation()
                    ->modalHeading(fn (ArticleVersion $r) => "Откатить к v{$r->version}?")
                    ->modalDescription('Эта версия станет текущей. Новые версии не удаляются — к ним можно вернуться так же.')
                    ->action(function (ArticleVersion $r) use ($article) {
                        app(ArticlePublisher::class)->rollback($article, $r);
                        Notification::make()->success()->title("Текущая версия — v{$r->version}")->send();
                        $this->redirect(ArticleResource::getUrl('edit', ['record' => $article]));
                    }),
            ]);
    }
}
