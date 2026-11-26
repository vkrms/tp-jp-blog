<?php

namespace App\Filament\Pages;

use App\Content\SiteRebuild;
use App\Models\AuditLog;
use App\Models\Setting;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;
use UnitEnum;

/**
 * Runtime settings (docs/spec.md §3.1, §9): Pause, publish mode, limits, AI budget, report recipients,
 * plus the manual "rebuild site now" fallback (§11.2).
 */
class Settings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;
    protected static string|UnitEnum|null $navigationGroup = 'Система';
    protected static ?string $title = 'Настройки';

    /** Keys managed on this page, with defaults. */
    public const KEYS = [
        'paused' => false,
        'publish_mode' => 'auto',
        'max_new_articles_per_week' => 2,
        'max_changed_articles_per_run' => 10,
        'report_recipients' => [],
        'ai_monthly_budget_usd' => null,
        'ai_reserved_for_agents_usd' => null,
    ];

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(collect(self::KEYS)->map(fn ($default, $key) => Setting::get($key, $default))->all());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                Section::make('Публикация')->columns(2)->schema([
                    Toggle::make('paused')->label('Пауза (аварийный стоп)')
                        ->helperText('Писатель и updater ничего не публикуют, пока включено.')
                        ->onColor('danger')->columnSpanFull(),
                    Select::make('publish_mode')->label('Режим публикации')->required()
                        ->options(['auto' => 'auto — публиковать сразу, если проверки прошли', 'review' => 'review — всё ждёт человека'])
                        ->helperText('auto с запуска (решение владельца контента); review — на случай инцидента.'),
                    TextInput::make('max_new_articles_per_week')->label('Новых статей в неделю, макс.')->numeric()->minValue(0)->required(),
                    TextInput::make('max_changed_articles_per_run')->label('Изменённых статей за запуск updater, макс.')->numeric()->minValue(1)->required()
                        ->helperText('Больше — запуск ждёт человека.'),
                ]),
                Section::make('Бюджет ИИ (один ключ OpenRouter)')->columns(2)->schema([
                    TextInput::make('ai_monthly_budget_usd')->label('Месячный бюджет, $')->numeric()->minValue(0)->placeholder('не задан'),
                    TextInput::make('ai_reserved_for_agents_usd')->label('Резерв под писателя и updater, $')->numeric()->minValue(0)->placeholder('не задан')
                        ->helperText('ИИ-действия редактора блокируются, когда расход за месяц больше «бюджет − резерв» (§9.1).'),
                ]),
                Section::make('Отчёты')->schema([
                    TagsInput::make('report_recipients')->label('Получатели недельного отчёта и алертов')->placeholder('email')
                        ->nestedRecursiveRules(['email']),
                ]),
            ]);
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            Form::make([EmbeddedSchema::make('form')])
                ->id('form')
                ->livewireSubmitHandler('save')
                ->footer([Actions::make([Action::make('save')->label('Сохранить')->submit('save')->keyBindings(['mod+s'])])]),
        ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $budget = $this->normalise('ai_monthly_budget_usd', $data['ai_monthly_budget_usd'] ?? null);
        $reserve = $this->normalise('ai_reserved_for_agents_usd', $data['ai_reserved_for_agents_usd'] ?? null);
        if ($reserve !== null && ($budget === null || $reserve > $budget)) {
            Notification::make()->danger()->title('Резерв не может быть больше месячного бюджета')->send();

            return;
        }
        $changed = [];
        foreach (self::KEYS as $key => $default) {
            $value = $this->normalise($key, $data[$key] ?? $default);
            if ($value !== Setting::get($key, $default)) {
                Setting::put($key, $value);
                $changed[] = $key;
            }
        }
        if ($changed) {
            AuditLog::record('settings', 'settings', null, ['changed' => $changed]);
        }
        Notification::make()->success()->title($changed ? 'Сохранено' : 'Изменений нет')->send();
    }

    public function getSubheading(): string|Htmlable|null
    {
        $last = Setting::get('last_rebuild');
        if (! $last) {
            return 'Сайт ещё не пересобирался из админки.';
        }

        return sprintf('Последняя пересборка: %s — %s%s', $last['at'] ?? '?', ($last['ok'] ?? false) ? 'запущена' : 'НЕ запущена',
            ($last['ok'] ?? false) ? '' : ' ('.($last['error'] ?? 'ошибка').')');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('rebuild')->label('Пересобрать сайт сейчас')->icon('heroicon-o-arrow-path')
                ->requiresConfirmation()
                ->modalDescription('Запускает сборку и выкладку сайта в GitHub Actions. Нужна, если автоматический запуск не прошёл.')
                ->action(function () {
                    $ok = app(SiteRebuild::class)->trigger('manual: admin');
                    $ok
                        ? Notification::make()->success()->title('Пересборка запущена')->body('Сайт обновится через несколько минут.')->send()
                        : Notification::make()->danger()->title('Пересборку запустить не удалось')->body(Setting::get('last_rebuild')['error'] ?? '')->persistent()->send();
                }),
        ];
    }

    private function normalise(string $key, mixed $value): mixed
    {
        return match ($key) {
            'paused' => (bool) $value,
            'max_new_articles_per_week', 'max_changed_articles_per_run' => (int) $value,
            'ai_monthly_budget_usd', 'ai_reserved_for_agents_usd' => $value === null || $value === '' ? null : (float) $value,
            'report_recipients' => array_values($value ?? []),
            default => $value,
        };
    }
}
