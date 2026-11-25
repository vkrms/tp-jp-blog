<?php

namespace App\Filament\Resources\Articles\RelationManagers;

use App\Content\SiteRebuild;
use App\Models\Article;
use App\Models\ArticleUpdateLog;
use App\Models\AuditLog;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;

/** 更新履歴: the public lines are shown on the site; internal notes never are. */
class UpdateLogRelationManager extends RelationManager
{
    protected static string $relationship = 'updateLog';
    protected static ?string $title = 'История обновлений (更新履歴)';
    protected static ?string $modelLabel = 'запись';

    public function isReadOnly(): bool
    {
        return false;
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            DatePicker::make('date')->label('Дата')->required()->default(now()),
            Grid::make(2)->schema([
                TextInput::make('public.ja')->label('Публичный текст (ja)')->required(),
                TextInput::make('public.en')->label('Публичный текст (en)')->required(),
                Textarea::make('internal_note.ja')->label('Внутренняя заметка (ja)')->helperText('На сайт не выводится.'),
                Textarea::make('internal_note.en')->label('Внутренняя заметка (en)'),
            ]),
        ])->columns(1);
    }

    public function table(Table $table): Table
    {
        $changed = fn (string $what) => function (ArticleUpdateLog $record) use ($what) {
            /** @var Article $article */
            $article = $this->getOwnerRecord();
            AuditLog::record('edit', 'article', $article->slug, ['update_log' => $what, 'date' => $record->date?->toDateString()]);
            if ($article->status === 'published') {
                DB::afterCommit(fn () => app(SiteRebuild::class)->trigger("{$article->slug}: update log {$what}"));
            }
        };

        return $table
            ->defaultSort('sort')
            ->columns([
                TextColumn::make('date')->label('Дата')->date('Y-m-d'),
                TextColumn::make('public.ja')->label('Публичный текст')->description(fn ($r) => $r->public['en'] ?? null)->wrap(),
                TextColumn::make('internal_note.ja')->label('Внутренняя заметка')->limit(80)->placeholder('—')->wrap(),
            ])
            ->headerActions([
                CreateAction::make()
                    ->mutateDataUsing(fn (array $data) => [...$data, 'sort' => (int) $this->getOwnerRecord()->updateLog()->max('sort') + 1])
                    ->after($changed('added')),
            ])
            ->recordActions([
                EditAction::make()->after($changed('edited')),
                DeleteAction::make()->after($changed('deleted')),
            ]);
    }
}
