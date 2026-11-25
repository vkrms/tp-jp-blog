<?php

namespace App\Filament\Resources\AuditLogs;

use App\Filament\Resources\AuditLogs\Pages\ListAuditLogs;
use App\Models\AuditLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Admin actions: edits, publish, rollback, archive, settings, site rebuilds. Read-only. */
class AuditLogResource extends Resource
{
    protected static ?string $model = AuditLog::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;
    protected static string|UnitEnum|null $navigationGroup = 'Журналы';
    protected static ?int $navigationSort = 3;
    protected static ?string $modelLabel = 'действие';
    protected static ?string $pluralModelLabel = 'Действия админки';

    public const ACTIONS = ['create' => 'Создание', 'edit' => 'Правка', 'publish' => 'Публикация', 'rollback' => 'Откат',
        'archive' => 'Архив', 'rebuild' => 'Пересборка сайта', 'settings' => 'Настройки'];

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Когда')->dateTime('Y-m-d H:i:s')->sortable(),
                TextColumn::make('user.name')->label('Кто')->placeholder('система'),
                TextColumn::make('action')->label('Действие')->badge()->formatStateUsing(fn ($state) => self::ACTIONS[$state] ?? $state)
                    ->color(fn (AuditLog $r) => $r->action === 'rebuild' && ($r->details['ok'] ?? true) === false ? 'danger' : 'gray'),
                TextColumn::make('subject_id')->label('Объект')->description(fn (AuditLog $r) => $r->subject_type)->placeholder('—'),
                TextColumn::make('details')->label('Детали')->wrap()->placeholder('—')
                    ->formatStateUsing(fn ($state) => json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)),
            ])
            ->filters([SelectFilter::make('action')->label('Действие')->options(self::ACTIONS)]);
    }

    public static function getPages(): array
    {
        return ['index' => ListAuditLogs::route('/')];
    }
}
