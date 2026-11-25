<?php

namespace App\Filament\Resources\TopicQueue\Pages;

use App\Filament\Resources\TopicQueue\TopicQueueResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTopics extends ListRecords
{
    protected static string $resource = TopicQueueResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
