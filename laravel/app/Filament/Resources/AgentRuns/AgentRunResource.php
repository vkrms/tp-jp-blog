<?php

namespace App\Filament\Resources\AgentRuns;

use App\Filament\Resources\AgentRuns\Pages\ListAgentRuns;
use App\Filament\Resources\AgentRuns\Pages\ViewAgentRun;
use App\Models\AgentRun;
use BackedEnum;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Model call audit: writer, updater and editor AI actions (docs/spec.md §3.1, §9). Read-only. */
class AgentRunResource extends Resource
{
    protected static ?string $model = AgentRun::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCpuChip;
    protected static string|UnitEnum|null $navigationGroup = 'Журналы';
    protected static ?int $navigationSort = 1;
    protected static ?string $modelLabel = 'запуск';
    protected static ?string $pluralModelLabel = 'Запуски ИИ';

    public const STATUS_COLORS = ['ok' => 'success', 'partial' => 'warning', 'failed' => 'danger',
        'blocked_paused' => 'gray', 'needs_human' => 'danger'];

    public static function canCreate(): bool
    {
        return false;
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->columns(4)->schema([
                TextEntry::make('agent')->label('Агент')->badge(),
                TextEntry::make('action')->label('Действие')->placeholder('—'),
                TextEntry::make('user.name')->label('Пользователь')->placeholder('—'),
                TextEntry::make('status')->label('Статус')->badge()->color(fn ($state) => self::STATUS_COLORS[$state] ?? 'gray'),
                TextEntry::make('started_at')->label('Начало')->dateTime('Y-m-d H:i:s'),
                TextEntry::make('finished_at')->label('Конец')->dateTime('Y-m-d H:i:s')->placeholder('—'),
                TextEntry::make('model')->label('Модель')->placeholder('—'),
                TextEntry::make('cost_usd')->label('Стоимость, $')->placeholder('—'),
                TextEntry::make('tokens_in')->label('Токены вход')->placeholder('—'),
                TextEntry::make('tokens_out')->label('Токены выход')->placeholder('—'),
                TextEntry::make('input_hash')->label('Хеш входа')->placeholder('—')->columnSpan(2),
            ]),
            Section::make('Отчёт')->schema([
                TextEntry::make('report')->hiddenLabel()->fontFamily('mono')->placeholder('—')
                    ->formatStateUsing(fn ($state) => json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)),
                TextEntry::make('error')->label('Ошибка')->color('danger')->placeholder('—'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('started_at', 'desc')
            ->columns([
                TextColumn::make('started_at')->label('Начало')->dateTime('Y-m-d H:i')->sortable(),
                TextColumn::make('agent')->label('Агент')->badge()->description(fn (AgentRun $r) => $r->action),
                TextColumn::make('user.name')->label('Пользователь')->placeholder('—'),
                TextColumn::make('status')->label('Статус')->badge()->color(fn ($state) => self::STATUS_COLORS[$state] ?? 'gray')->placeholder('идёт'),
                TextColumn::make('model')->label('Модель')->placeholder('—')->toggleable(),
                TextColumn::make('cost_usd')->label('$')->placeholder('—'),
            ])
            ->filters([
                SelectFilter::make('agent')->label('Агент')->options(['writer' => 'writer', 'updater' => 'updater', 'editor' => 'editor']),
                SelectFilter::make('status')->label('Статус')->options(array_combine(array_keys(self::STATUS_COLORS), array_keys(self::STATUS_COLORS))),
            ])
            ->recordActions([ViewAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAgentRuns::route('/'),
            'view' => ViewAgentRun::route('/{record}'),
        ];
    }
}
