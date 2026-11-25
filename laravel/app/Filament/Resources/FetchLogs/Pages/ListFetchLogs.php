<?php

namespace App\Filament\Resources\FetchLogs\Pages;

use App\Filament\Resources\FetchLogs\FetchLogResource;
use Filament\Resources\Pages\ListRecords;

class ListFetchLogs extends ListRecords
{
    protected static string $resource = FetchLogResource::class;
}
