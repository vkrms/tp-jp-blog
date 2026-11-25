<?php

namespace App\Filament\Resources\Facts\Pages;

use App\Filament\Resources\Facts\FactResource;
use App\Models\AuditLog;
use Filament\Resources\Pages\CreateRecord;

class CreateFact extends CreateRecord
{
    protected static string $resource = FactResource::class;

    protected function afterCreate(): void
    {
        AuditLog::record('create', 'fact', $this->record->fact_id);
    }
}
