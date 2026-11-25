<?php

namespace App\Filament\Resources\Articles;

use App\Content\Text;
use App\Filament\Resources\Articles\Pages\EditArticle;
use App\Filament\Resources\Articles\Pages\ListArticles;
use App\Filament\Resources\Articles\RelationManagers\UpdateLogRelationManager;
use App\Filament\Resources\Articles\RelationManagers\VersionsRelationManager;
use App\Models\Article;
use App\Models\Category;
use App\Models\Source;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\CodeEditor;
use Filament\Forms\Components\CodeEditor\Enums\Language;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

/** Articles: card, current content, versions with diff/rollback, publish/archive (docs/spec.md §9). */
class ArticleResource extends Resource
{
    protected static ?string $model = Article::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;
    protected static string|UnitEnum|null $navigationGroup = 'Контент';
    protected static ?int $navigationSort = 1;
    protected static ?string $modelLabel = 'статья';
    protected static ?string $pluralModelLabel = 'Статьи';
    protected static ?string $recordTitleAttribute = 'slug';

    public const STATUS_LABELS = [
        'draft' => 'Черновик',
        'pending_review' => 'Ждёт проверки',
        'published' => 'Опубликована',
        'archived' => 'В архиве',
    ];

    public const STATUS_COLORS = [
        'draft' => 'gray',
        'pending_review' => 'warning',
        'published' => 'success',
        'archived' => 'danger',
    ];

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['currentVersion', 'category']);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Карточка')
                ->columns(3)
                ->schema([
                    Select::make('category_id')->label('Категория')->required()
                        ->options(fn () => Category::orderBy('sort')->get()->mapWithKeys(fn ($c) => [$c->id => $c->title['ja'].' / '.$c->title['en']])),
                    Select::make('level')->label('Уровень')->required()->options([0 => '初級 (начальный)', 1 => '中級 (средний)']),
                    TextInput::make('read_minutes')->label('Минут чтения')->numeric()->minValue(1)->required(),
                    TextInput::make('keyword')->label('Ключевой запрос')->columnSpan(2),
                    TextInput::make('icon')->label('Иконка'),
                ]),
            Section::make('Содержимое текущей версии')
                ->description('Сохранение создаёт новую версию. Перед сохранением текст проверяется валидатором; опубликованная статья после сохранения уходит на пересборку сайта.')
                ->schema([
                    CodeEditor::make('content_json')->label('Содержимое (JSON)')
                        ->language(Language::Json)
                        ->helperText('Поля: title, eyebrow, answer_first, sections, faq, matome, related. Тексты — [ja, en] или {"ja", "en"}. Формат: docs/spec-stage1.md §3.2.')
                        ->required(),
                    Select::make('source_ids')->label('Источники')->multiple()->searchable()
                        ->options(fn () => Source::orderBy('id')->get()->mapWithKeys(fn ($s) => [$s->id => "{$s->id} — {$s->name['ja']}"])),
                    TextInput::make('change_summary')->label('Что изменено (для истории версий)'),
                    Grid::make(2)->schema([
                        TextInput::make('public_note_ja')->label('Запись в 更新履歴 (ja)')
                            ->helperText('Необязательно. Если заполнено, на сайте появится строка истории обновлений.'),
                        TextInput::make('public_note_en')->label('Запись в 更新履歴 (en)')
                            ->requiredWith('public_note_ja'),
                    ]),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('content_updated_at', 'desc')
            ->columns([
                TextColumn::make('title')->label('Заголовок')
                    ->state(fn (Article $r) => Text::ja($r->currentVersion?->content['title'] ?? []))
                    ->description(fn (Article $r) => $r->slug)
                    ->wrap(),
                TextColumn::make('category_id')->label('Категория')->badge(),
                TextColumn::make('status')->label('Статус')->badge()
                    ->formatStateUsing(fn (string $state) => self::STATUS_LABELS[$state] ?? $state)
                    ->color(fn (string $state) => self::STATUS_COLORS[$state] ?? 'gray'),
                TextColumn::make('currentVersion.version')->label('Версия')->prefix('v'),
                TextColumn::make('content_updated_at')->label('Обновлена')->date('Y-m-d')->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->label('Статус')->options(self::STATUS_LABELS),
                SelectFilter::make('category_id')->label('Категория')
                    ->options(fn () => Category::orderBy('sort')->pluck('id', 'id')),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getRelations(): array
    {
        return [VersionsRelationManager::class, UpdateLogRelationManager::class];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListArticles::route('/'),
            'edit' => EditArticle::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false; // new articles come from the writer (or the import), not from a blank form
    }
}
