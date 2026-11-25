<?php

namespace Tests\Feature;

use App\Content\ArticlePayload;
use App\Content\ArticleValidator;
use App\Models\Article;
use App\Models\Source;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** content:validate and the rules it enforces (docs/spec.md §6), on real imported content. */
class ArticleValidatorTest extends TestCase
{
    use RefreshDatabase;

    private ArticleValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('content:import')->assertSuccessful();
        $rules = json_decode(file_get_contents(config('content.path').'/rules.json'), true);
        $this->validator = new ArticleValidator($rules, Source::pluck('id')->all(), Article::pluck('slug')->all());
    }

    private function article(string $slug = 'what-is-affiliate'): array
    {
        return ArticlePayload::full(Article::where('slug', $slug)->with(['currentVersion', 'updateLog'])->firstOrFail());
    }

    /** Put a phrase into the first paragraph of the article. */
    private function withPhrase(array $a, string $phrase): array
    {
        $a['sections'][0]['b'][0] = ['p' => [$phrase, 'text']];

        return $a;
    }

    private function errors(array $a): array
    {
        return $this->validator->validate($a)['errors'];
    }

    private function assertErrorLike(string $needle, array $a): void
    {
        $errors = $this->errors($a);
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, $needle)),
            "expected an error containing «{$needle}», got: ".json_encode($errors, JSON_UNESCAPED_UNICODE));
    }

    public function test_imported_content_is_clean_like_validate_mjs(): void
    {
        $this->artisan('content:validate')->expectsOutput('Статей: 12. Ошибок: 0. Предупреждений: 0')->assertSuccessful();
    }

    public function test_command_fails_on_errors(): void
    {
        $article = Article::where('slug', 'what-is-affiliate')->firstOrFail();
        $version = $article->currentVersion;
        $content = $version->content;
        $content['title'] = ['必ず稼げる方法', 'A sure way to earn'];
        $version->update(['content' => $content]);

        $this->artisan('content:validate')->assertFailed();
    }

    public function test_forbidden_wording(): void
    {
        $this->assertErrorLike('必ず稼げる', $this->withPhrase($this->article(), '必ず稼げる'));
    }

    public function test_forbidden_except_respects_allowed_slugs(): void
    {
        $this->assertErrorLike('ニッチ', $this->withPhrase($this->article(), 'ニッチな話'));
        $this->assertSame([], $this->errors($this->withPhrase($this->article('pick-niche'), 'ニッチな話')));
    }

    public function test_excluded_topics(): void
    {
        $this->assertErrorLike('исключённая тема', $this->withPhrase($this->article(), '確定申告のやり方'));
    }

    public function test_service_text_in_body_and_public_log(): void
    {
        $this->assertErrorLike('служебная формулировка', $this->withPhrase($this->article(), 'これは下書きです'));

        $a = $this->article();
        $a['update_log'][0]['public'] = ['公開前の確認', 'draft'];
        $this->assertErrorLike('служебный текст', $a);
    }

    public function test_unknown_source_and_related(): void
    {
        $a = $this->article();
        $a['sources'][] = 'nope';
        $a['related'] = ['missing-article'];
        $this->assertErrorLike('источник nope', $a);
        $this->assertErrorLike('related: статьи missing-article нет', $a);
    }

    public function test_both_languages_required(): void
    {
        $a = $this->article();
        $a['title'] = ['タイトル', ''];
        $this->assertErrorLike('title: нужен текст на обоих языках', $a);

        $a = $this->article();
        $a['faq'][0] = [['質問', 'Question'], ['答え']];
        $this->assertErrorLike('faq[0]', $a);
    }

    public function test_table_cells_may_be_blank_in_both_languages_only(): void
    {
        $table = ['table' => ['head' => [['', ''], ['列', 'Column']], 'rows' => [[['行', 'Row'], ['値', 'Value']]]]];
        $a = $this->article();
        $a['sections'][0]['b'][0] = $table;
        $this->assertSame([], $this->errors($a));

        $table['table']['rows'][0][1] = ['値', ''];
        $a['sections'][0]['b'][0] = $table;
        $this->assertErrorLike('table.rows[0][1]', $a);
    }

    public function test_unknown_block_type_and_bad_slug(): void
    {
        $a = $this->article();
        $a['sections'][0]['b'][0] = ['video' => 'x'];
        $a['slug'] = 'Bad_Slug';
        $this->assertErrorLike('неизвестный блок: video', $a);
        $this->assertErrorLike('slug «Bad_Slug»', $a);
    }

    public function test_faq_count_is_a_warning(): void
    {
        $a = $this->article();
        $a['faq'] = [$a['faq'][0]];
        $result = $this->validator->validate($a);
        $this->assertSame([], $result['errors']);
        $this->assertStringContainsString('FAQ: 1', $result['warnings'][0]);
    }
}
