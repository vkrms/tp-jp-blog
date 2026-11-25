<?php

namespace App\Filament\Resources\Sources\Pages;

use App\Filament\Resources\Sources\SourceResource;
use App\Models\AuditLog;
use Filament\Resources\Pages\CreateRecord;

class CreateSource extends CreateRecord
{
    protected static string $resource = SourceResource::class;

    protected function afterCreate(): void
    {
        AuditLog::record('create', 'source', $this->record->id);
    }
}
