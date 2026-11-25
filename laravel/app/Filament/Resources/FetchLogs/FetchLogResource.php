<?php

namespace App\Filament\Resources\FetchLogs;

use App\Filament\Resources\FetchLogs\Pages\ListFetchLogs;
use App\Models\FetchLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Downloaded / cited pages with the prompt-injection flag (docs/spec.md §4.4). Read-only. */
class FetchLogResource extends Resource
{
    protected static ?string $model = FetchLog::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowDownTray;
    protected static string|UnitEnum|null $navigationGroup = 'Журналы';
    protected static ?int $navigationSort = 2;
    protected static ?string $modelLabel = 'загрузка';
    protected static ?string $pluralModelLabel = 'Загрузки страниц';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('fetched_at', 'desc')
            ->columns([
                TextColumn::make('fetched_at')->label('Когда')->dateTime('Y-m-d H:i')->sortable(),
                IconColumn::make('injection_suspected')->label('Инъекция?')->boolean()
                    ->trueIcon('heroicon-o-exclamation-triangle')->trueColor('danger')
                    ->falseIcon('heroicon-o-check')->falseColor('gray'),
                TextColumn::make('url')->label('URL')->limit(70)->url(fn (FetchLog $r) => $r->url, true)
                    ->description(fn (FetchLog $r) => str($r->text_excerpt)->limit(140)),
                TextColumn::make('http_status')->label('HTTP')->placeholder('—'),
                TextColumn::make('run_id')->label('Запуск')->prefix('#')->placeholder('—'),
            ])
            ->filters([TernaryFilter::make('injection_suspected')->label('Подозрение на инъекцию')]);
    }

    public static function getPages(): array
    {
        return ['index' => ListFetchLogs::route('/')];
    }
}
