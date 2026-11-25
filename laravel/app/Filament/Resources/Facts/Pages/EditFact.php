<?php

namespace App\Filament\Resources\Facts\Pages;

use App\Filament\Resources\Facts\FactResource;
use App\Models\AuditLog;
use Filament\Resources\Pages\EditRecord;

class EditFact extends EditRecord
{
    protected static string $resource = FactResource::class;

    protected function afterSave(): void
    {
        AuditLog::record('edit', 'fact', $this->record->fact_id);
    }
}
