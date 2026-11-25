<?php

namespace App\Filament\Resources\TopicQueue\Pages;

use App\Filament\Resources\TopicQueue\TopicQueueResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTopic extends CreateRecord
{
    protected static string $resource = TopicQueueResource::class;
}
