<?php

namespace App\Filament\Resources\Sources\Pages;

use App\Filament\Resources\Sources\SourceResource;
use App\Models\AuditLog;
use Filament\Resources\Pages\EditRecord;

class EditSource extends EditRecord
{
    protected static string $resource = SourceResource::class;

    protected function afterSave(): void
    {
        AuditLog::record('edit', 'source', $this->record->id);
    }
}
