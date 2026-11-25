<?php

namespace App\Filament\Resources\Facts;

use App\Filament\Resources\Facts\Pages\CreateFact;
use App\Filament\Resources\Facts\Pages\EditFact;
use App\Filament\Resources\Facts\Pages\ListFacts;
use App\Models\Fact;
use App\Models\Source;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

/** Fact registry (docs/spec.md §3.1–3.2). Values are not rendered on the site until the placeholder migration. */
class FactResource extends Resource
{
    protected static ?string $model = Fact::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedHashtag;
    protected static string|UnitEnum|null $navigationGroup = 'Контент';
    protected static ?int $navigationSort = 2;
    protected static ?string $modelLabel = 'факт';
    protected static ?string $pluralModelLabel = 'Факты';
    protected static ?string $recordTitleAttribute = 'fact_id';

    public const REFRESH = ['week' => 'Неделя', 'month' => 'Месяц', 'quarter' => 'Квартал', 'year' => 'Год', 'event' => 'По событию'];

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->columns(2)->schema([
                TextInput::make('fact_id')->label('ID факта')->required()->regex('/^[a-z0-9]+([.\-][a-z0-9]+)*$/')
                    ->unique(ignoreRecord: true)->disabledOn('edit')
                    ->helperText('Например jao.survey.share_30k. После создания не меняется.'),
                Select::make('refresh')->label('Проверять раз в')->options(self::REFRESH)->required(),
                TextInput::make('value.ja')->label('Значение (ja)')
                    ->helperText('Фрагмент текста для подстановки {{fact:…}}. Пока плейсхолдеров нет, на сайт не выводится.'),
                TextInput::make('value.en')->label('Значение (en)')->requiredWith('value.ja'),
                Textarea::make('internal_note')->label('Внутренняя заметка')->rows(3)->columnSpanFull(),
            ]),
            Section::make('Источник')->columns(3)->schema([
                Select::make('source_id')->label('Источник')->searchable()
                    ->options(fn () => Source::orderBy('id')->get()->mapWithKeys(fn ($s) => [$s->id => "{$s->id} — {$s->name['ja']}"])),
                TextInput::make('source_url')->label('URL')->columnSpan(2),
                TextInput::make('source_date')->label('Дата источника')->regex('/^\d{4}-\d{2}(-\d{2})?$/')->placeholder('YYYY-MM-DD'),
                DateTimePicker::make('checked_at')->label('Проверен'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('fact_id')
            ->columns([
                TextColumn::make('fact_id')->label('ID')->searchable()->sortable()
                    ->description(fn (Fact $r) => str($r->internal_note)->limit(90)),
                IconColumn::make('has_value')->label('Значение ja/en')->boolean()
                    ->state(fn (Fact $r) => filled($r->value['ja'] ?? null)),
                TextColumn::make('source_id')->label('Источник')->badge(),
                TextColumn::make('refresh')->label('Проверка')->formatStateUsing(fn ($state) => self::REFRESH[$state] ?? $state),
                TextColumn::make('checked_at')->label('Проверен')->date('Y-m-d')->placeholder('ещё нет')->sortable(),
                TextColumn::make('articles_count')->label('Статей')->counts('articles'),
            ])
            ->filters([SelectFilter::make('refresh')->label('Проверка')->options(self::REFRESH)])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFacts::route('/'),
            'create' => CreateFact::route('/create'),
            'edit' => EditFact::route('/{record}/edit'),
        ];
    }
}
