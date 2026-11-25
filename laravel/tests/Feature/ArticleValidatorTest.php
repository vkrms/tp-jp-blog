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
        $this->validator = ArticleValidator::fromDatabase();
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
        // Same result as tools/validate.mjs: no errors; warnings (missing source links, long titles) until content is fixed.
        $this->artisan('content:validate')->expectsOutputToContain('Ошибок: 0.')->assertSuccessful();
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

    private function warningsLike(string $needle, array $a): array
    {
        return array_values(array_filter($this->validator->validate($a)['warnings'], fn ($w) => str_contains($w, $needle)));
    }

    public function test_source_links_must_be_https_on_registered_hosts_with_real_anchors(): void
    {
        $this->assertErrorLike('адрес не https', $this->withPhrase($this->article(), '[JAO](http://www.japan-affiliate.org/news/survey2025/)'));
        $this->assertErrorLike('нет в реестре источников', $this->withPhrase($this->article(), '[調査](https://evil.example.com/page)'));
        $this->assertErrorLike('анкор «こちら» запрещён', $this->withPhrase($this->article(), '[こちら](https://www.japan-affiliate.org/news/survey2025/)'));
        $this->assertNotEmpty($this->warningsLike('ведёт на главную',
            $this->withPhrase($this->article(), '[JAO](https://www.japan-affiliate.org/)')));
    }

    public function test_linking_a_source_clears_its_warning(): void
    {
        $a = $this->article(); // what-is-affiliate: sources yano, jaoabout, moshimo, moshimohelp
        $this->assertNotEmpty($this->warningsLike('«yano»', $a));

        $yano = Source::find('yano')->url;
        $linked = $this->withPhrase($a, "[矢野経済研究所の調査]({$yano})によると");
        $this->assertSame([], $this->warningsLike('«yano»', $linked));
        $this->assertSame([], $this->errors($linked));
    }

    public function test_enforced_source_links_become_errors(): void
    {
        $rules = json_decode(file_get_contents(config('content.path').'/rules.json'), true);
        $rules['source_links']['enforce'] = true;
        $strict = new ArticleValidator($rules, Source::pluck('url', 'id')->all(), Article::pluck('keyword', 'slug')->all());

        $this->assertNotEmpty(array_filter($strict->validate($this->article())['errors'], fn ($e) => str_contains($e, 'не привязан ссылкой')));
    }

    public function test_seo_warnings(): void
    {
        $a = $this->article();
        $a['title'] = [str_repeat('あ', 33), 'Long title'];
        $a['related'] = [];
        $a['keyword'] = Article::where('slug', 'earn-or-not')->value('keyword');
        $this->assertNotEmpty($this->warningsLike('title 33 знаков', $a));
        $this->assertNotEmpty($this->warningsLike('related: 0', $a));
        $this->assertNotEmpty($this->warningsLike('уже у статьи earn-or-not', $a));
    }
}
