<?php

namespace App\Filament\Resources\TopicQueue;

use App\Filament\Resources\TopicQueue\Pages\CreateTopic;
use App\Filament\Resources\TopicQueue\Pages\EditTopic;
use App\Filament\Resources\TopicQueue\Pages\ListTopics;
use App\Models\Article;
use App\Models\TopicQueueItem;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Writer topic queue (docs/spec.md §4.2): highest monthly volume first, held topics are skipped. */
class TopicQueueResource extends Resource
{
    protected static ?string $model = TopicQueueItem::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedQueueList;
    protected static string|UnitEnum|null $navigationGroup = 'Контент';
    protected static ?int $navigationSort = 4;
    protected static ?string $slug = 'topic-queue';
    protected static ?string $modelLabel = 'тема';
    protected static ?string $pluralModelLabel = 'Очередь тем';
    protected static ?string $recordTitleAttribute = 'topic';

    public const STATUSES = ['idea' => 'Идея', 'ready' => 'Готова', 'held' => 'Отложена', 'used' => 'Использована'];
    public const COLORS = ['idea' => 'gray', 'ready' => 'success', 'held' => 'warning', 'used' => 'info'];

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->columns(2)->schema([
                TextInput::make('keyword')->label('Ключевой запрос')->required(),
                TextInput::make('topic')->label('Тема')->required(),
                TextInput::make('monthly_volume')->label('Запросов в месяц')->numeric()->minValue(0),
                Select::make('status')->label('Статус')->options(self::STATUSES)->required()->default('idea')
                    ->helperText('Писатель берёт «Готова» и «Идея»; «Отложена» пропускается.'),
                Textarea::make('reason')->label('Причина / заметка')->columnSpanFull(),
                Select::make('article_id')->label('Статья')->placeholder('—')->searchable()
                    ->options(fn () => Article::orderBy('slug')->pluck('slug', 'id')),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('monthly_volume', 'desc')
            ->columns([
                TextColumn::make('keyword')->label('Запрос')->searchable()->description(fn (TopicQueueItem $r) => $r->topic),
                TextColumn::make('monthly_volume')->label('В месяц')->numeric()->sortable()->placeholder('—'),
                TextColumn::make('status')->label('Статус')->badge()
                    ->formatStateUsing(fn ($state) => self::STATUSES[$state] ?? $state)
                    ->color(fn ($state) => self::COLORS[$state] ?? 'gray'),
                TextColumn::make('reason')->label('Причина')->limit(60)->placeholder('—'),
                TextColumn::make('article.slug')->label('Статья')->placeholder('—'),
            ])
            ->filters([SelectFilter::make('status')->label('Статус')->options(self::STATUSES)])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTopics::route('/'),
            'create' => CreateTopic::route('/create'),
            'edit' => EditTopic::route('/{record}/edit'),
        ];
    }
}
