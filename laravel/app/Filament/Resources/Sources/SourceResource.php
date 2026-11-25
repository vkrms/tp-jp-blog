<?php

namespace App\Filament\Resources\Sources;

use App\Filament\Resources\Sources\Pages\CreateSource;
use App\Filament\Resources\Sources\Pages\EditSource;
use App\Filament\Resources\Sources\Pages\ListSources;
use App\Models\Source;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Source registry (docs/spec.md §3.1, §4.4). Only fetch_allowed https domains are fetched or searched. */
class SourceResource extends Resource
{
    protected static ?string $model = Source::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedGlobeAlt;
    protected static string|UnitEnum|null $navigationGroup = 'Контент';
    protected static ?int $navigationSort = 3;
    protected static ?string $modelLabel = 'источник';
    protected static ?string $pluralModelLabel = 'Источники';
    protected static ?string $recordTitleAttribute = 'id';

    public const TYPES = ['gov' => 'Госорган', 'assoc' => 'Отраслевая ассоциация', 'research' => 'Исследование рынка',
        'asp' => 'ASP (конкурент)', 'news' => 'Отраслевые новости', 'seo' => 'SEO-блог', 'internal' => 'Внутренний'];

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->columns(2)->schema([
                TextInput::make('id')->label('ID')->required()->regex('/^[a-z0-9-]+$/')->unique(ignoreRecord: true)->disabledOn('edit'),
                Select::make('type')->label('Тип')->options(self::TYPES)->required(),
                TextInput::make('name.ja')->label('Название (ja)')->required(),
                TextInput::make('name.en')->label('Название (en)')->required(),
                TextInput::make('url')->label('URL')->required()->columnSpanFull(),
                DatePicker::make('published_at')->label('Опубликован'),
                Select::make('tier')->label('Tier')->options([1 => '1 — список Мариши, побеждает при противоречии', 2 => '2 — прочие'])->required()->default(1),
                Select::make('refresh')->label('Проверять раз в')->options(['week' => 'Неделя', 'month' => 'Месяц', 'quarter' => 'Квартал', 'year' => 'Год', 'event' => 'По событию']),
                Toggle::make('fetch_allowed')->label('Можно скачивать и искать')->default(true)
                    ->helperText('Выключено для внутренних источников (TP Messagings).'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id')
            ->columns([
                TextColumn::make('id')->label('ID')->searchable()->sortable()->description(fn (Source $r) => $r->name['ja'] ?? ''),
                TextColumn::make('type')->label('Тип')->badge()->formatStateUsing(fn ($state) => self::TYPES[$state] ?? $state),
                TextColumn::make('tier')->label('Tier'),
                IconColumn::make('fetch_allowed')->label('Скачивание')->boolean(),
                TextColumn::make('url')->label('URL')->limit(50)->url(fn (Source $r) => str_starts_with($r->url, 'http') ? $r->url : null, true),
                TextColumn::make('last_checked_at')->label('Проверен')->date('Y-m-d')->placeholder('—'),
            ])
            ->filters([SelectFilter::make('type')->label('Тип')->options(self::TYPES)])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSources::route('/'),
            'create' => CreateSource::route('/create'),
            'edit' => EditSource::route('/{record}/edit'),
        ];
    }
}
