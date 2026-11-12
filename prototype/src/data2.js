/* Source registry and article upgrades. Facts only from pages read on 2026-11-09 (see SRC). tier 1 = sources supplied by Mariya. */
var CHECKED='2026-11-09';
var STYPE={gov:['公的機関','Government'],assoc:['業界団体','Industry body'],research:['市場調査','Market research'],asp:['ASP（競合）公式情報','ASP (competitor) own info'],news:['業界ニュース','Trade news'],seo:['SEO専門ブログ','SEO blog']};
function SR(id,ja,en,u,d,t){return {id:id,n:[ja,en],u:u,d:d,t:t}}
var SRC={
 jao25:SR('jao25','日本アフィリエイト協議会（JAO）「アフィリエイト市場調査2025」','JAO Affiliate Market Survey 2025','https://www.japan-affiliate.org/news/survey2025/','2026-06-12','assoc'),
 jaoabout:SR('jaoabout','JAO「日本アフィリエイト協議会とは」','JAO: about the association','https://www.japan-affiliate.org/about/','n/a','assoc'),
 jaoguide:SR('jaoguide','JAO「アフィリエイト・ガイドライン」','JAO Affiliate Guideline','https://www.japan-affiliate.org/guideline/','n/a','assoc'),
 jaosummit:SR('jaosummit','JAO「Japan Affiliate Summit 2026」','JAO: Japan Affiliate Summit 2026','https://www.japan-affiliate.org/news/honki2026/','2026-10-19','assoc'),
 yano:SR('yano','矢野経済研究所 プレスリリース「アフィリエイト市場に関する調査を実施（2026年）」','Yano Research Institute press release: affiliate market survey 2026','https://www.yano.co.jp/press-release/show/press_id/4056','2026-03-18','research'),
 yanorep:SR('yanorep','矢野経済研究所「2026 アフィリエイト市場の動向と展望」（有料レポート）','Yano: 2026 Affiliate Market Trends and Outlook (paid report)','https://www.yano.co.jp/market_reports/C67123400','2026-01-30','research'),
 a8camp:SR('a8camp','A8.net「キャンペーン」','A8.net campaigns page','https://www.a8.net/camp.html','n/a','asp'),
 a8yearend:SR('a8yearend','A8スタッフブログ「ふるさと納税・年末売れ筋サービス特集」','A8 staff blog: year-end features','https://a8pr.jp/2026/10/21/yearend2026/','2026-10-21','asp'),
 a8bf:SR('a8bf','A8スタッフブログ「ブラックフライデー特集」','A8 staff blog: Black Friday feature','https://a8pr.jp/2026/10/07/blackfriday2026/','2026-10-07','asp'),
 moshimo:SR('moshimo','もしもアフィリエイト「はじめての方へ」','Moshimo Affiliate: for beginners','https://af.moshimo.com/af/www/beginner','n/a','asp'),
 moshimohelp:SR('moshimohelp','もしもアフィリエイト「よくある質問」','Moshimo Affiliate: FAQ','https://af.moshimo.com/af/www/help','n/a','asp'),
 moshimorew:SR('moshimorew','もしもアフィリエイト「W報酬制度」','Moshimo Affiliate: W reward','https://af.moshimo.com/af/www/about/reward','n/a','asp'),
 tvout:SR('tvout','TravelVoice「JNTO 訪日・出国者数（出国者）2026年9月」','TravelVoice: JNTO outbound travellers, Sep 2026','https://www.travelvoice.jp/20261021-160713','2026-10-21','news'),
 tvin:SR('tvin','TravelVoice「JNTO 訪日外客数 2026年9月」','TravelVoice: JNTO inbound visitors, Sep 2026','https://www.travelvoice.jp/20261021-160712','2026-10-21','news'),
 tvwtm:SR('tvwtm','TravelVoice「WTM Global Travel Report 2026」','TravelVoice: WTM Global Travel Report 2026','https://www.travelvoice.jp/20261106-160802','2026-11-06','news'),
 tr1:SR('tr1','TRAICY「エティハド航空 11.11セール」','TRAICY: Etihad 11.11 sale','https://www.traicy.com/posts/20261108387264/','2026-11-08','news'),
 tr2:SR('tr2','TRAICY「ジェットスター・ジャパン スーパースターセール」','TRAICY: Jetstar Japan Super Star Sale','https://www.traicy.com/posts/20261105386920/','2026-11-05','news'),
 tr3:SR('tr3','TRAICY「トキエア 冬タイムセール」','TRAICY: Toki Air winter time sale','https://www.traicy.com/posts/20261106386983/','2026-11-06','news'),
 tr4:SR('tr4','TRAICY「ANAとIHG 新プログラム」','TRAICY: ANA and IHG new programme','https://www.traicy.com/posts/20261106386985/','2026-11-06','news'),
 tr5:SR('tr5','TRAICY「KLM リアルディールデイズ」','TRAICY: KLM Real Deal Days','https://www.traicy.com/posts/20261107387035/','2026-11-07','news'),
 suzctr:SR('suzctr','鈴木謙一「AI OverviewsとAIモードのCTR（28日間のオプトアウト実験）」','Kenichi Suzuki: CTR of AI Overviews and AI Mode (28-day opt-out experiment)','https://www.suzukikenichi.com/blog/ctr-for-ai-overviews-and-ai-mode-estimated-at-more-than-double-the-site-wide-search-ctr-in-a-28-day-opt-out-experiment/','2026-11-06','seo'),
 suzmu:SR('suzmu','鈴木謙一「ジョン・ミューラー氏インタビュー：リスト記事や大量のAIコンテンツは長続きしない」','Kenichi Suzuki: John Mueller interview on listicles and mass AI content','https://www.suzukikenichi.com/blog/john-mueller-interview-seo-shortcuts-like-listicles-and-mass-ai-content-dont-last/','2026-11-04','seo'),
 suzhr:SR('suzhr','鈴木謙一「AI記事は人間が確認、偽の専門家は不可：Googleがコンテンツの信頼性を強化」','Kenichi Suzuki: human review for AI articles, no fake experts','https://www.suzukikenichi.com/blog/human-review-for-ai-articles-no-fake-experts-google-reinforces-content-trustworthiness/','2026-10-05','seo'),
 suzbing:SR('suzbing','鈴木謙一「Bing、AI利用の制御を刷新」','Kenichi Suzuki: Bing overhauls AI usage controls','https://www.suzukikenichi.com/blog/bing-overhauls-ai-usage-controls-training-and-grounding-can-now-be-set-separately-replacing-noarchive-nocache/','2026-11-05','seo')
};
/* public log line + internal editorial note (3rd element, never shown on the site) */
function LG(ja,en){return ['2026-11-09',['初版を公開','First published'],[ja,en]]}
CATS.push({id:'seo',t:['SEO・AI検索','SEO & AI search'],c:'#6b6b6b'},{id:'market',t:['データ・市場','Data & market'],c:'#8b8b8b'});

/* ---- upgrade existing articles ---- */
(function(){
 var by={};A.forEach(function(a){by[a.id]=a});
 var w=by['what-is-affiliate'],e=by['earn-or-not'],ad=by['ad-affiliate'],tb=by['travel-blog-income'],pn=by['pick-niche'];
 w.lvl=0;w.src=['yano','jaoabout','moshimo','moshimohelp'];w.log=[LG('初版を作成。市場規模の数字を矢野経済研究所の公開情報で追加。','First version. Market-size figures added from Yano’s public release.')];
 w.secs.splice(4,0,{h:['日本のアフィリエイト市場の規模','The size of the Japanese affiliate market'],b:[
  {p:['矢野経済研究所によると、国内のアフィリエイト市場は拡大を続けています。2024年度は**4,379億円**、2025年度は**4,598億円**（前年度比5.0%増の見込み）です。','According to Yano Research Institute, the domestic affiliate market keeps growing: **¥437.9 billion** in FY2024 and **¥459.8 billion** in FY2025 (an estimated 5.0% increase).']},
  {table:{head:[['年度','Fiscal year'],['市場規模','Market size'],['前年度比','Year on year'],['区分','Status']],rows:[
   [['2024年度','FY2024'],['4,379億円','¥437.9bn'],['106.5%','106.5%'],['実績','Actual']],
   [['2025年度','FY2025'],['4,598億円','¥459.8bn'],['105.0%','105.0%'],['見込み','Estimate']],
   [['2029年度','FY2029'],['約5,883億円','About ¥588.3bn'],['—','—'],['予測','Forecast']]]}},
  {p:['2029年度までの年平均成長率は「約6%台」と見られています。一方で、ASP市場については「過去のような年率10%を超える高成長は見込みにくい」と述べられています。','The average annual growth to FY2029 is put at “about 6%”. For the ASP market the release says growth above 10% a year, as in the past, is hard to expect.']},
  {warn:[['注意','Caution'],['市場規模は「業界全体」の数字で、個人のブログの収入を示すものではありません。収入の実態は「稼げない？」の記事で、JAOの調査をもとに解説しています。','Market size describes the whole industry, not a single blog’s income. See the “Is it a dead end?” article for income data from the JAO survey.']]}]});
 w.secs.splice(5,0,{h:['業界団体：日本アフィリエイト協議会（JAO）','Industry body: Japan Affiliate Organization (JAO)'],b:[
  {p:['国内には、広告主、アフィリエイトサイト運営者、ASPが参加する業界団体があります。一般社団法人 日本アフィリエイト協議会（JAO）は、2012年11月1日に発足し、2020年7月に一般社団法人になりました。','Japan has an industry body that brings advertisers, site owners and ASPs together. The JAO was founded on 1 November 2012 and became a general incorporated association in July 2020.']},
  {p:['JAOは、アフィリエイトの基礎教育、業界の情報交換、行政との連携、ガイドラインの公開などを行っています。','The JAO works on basic education, information exchange, liaison with the authorities and publishing a guideline.']}]});
 w.rel=['earn-or-not'];
 e.lvl=0;e.src=['jao25','jaoguide'];e.log=[LG('JAO「アフィリエイト市場調査2025」の数字を追加し、冒頭と「よくある質問」を差し替え。','Added figures from the JAO 2025 survey and rewrote the lead and FAQ.')];
 e.s=['JAOの2025年調査では、アフィリエイトで**月3万円以上**を得ている人は12.4%、**月1,000円未満**の人は52.5%でした。「稼げない」という声が多い背景は数字にも表れていますが、調査は、時間と手間をかけて運営している人ほど収入が高い傾向にあるとも伝えています。','In the JAO 2025 survey, **12.4%** of site owners earned **¥30,000 or more a month** and **52.5%** earned **under ¥1,000**. The numbers reflect why many say “you can’t earn”, but the survey also reports that people who put in more time and effort tend to earn more.'];
 e.secs.unshift({h:['調査で見る：アフィリエイトの収入の実態','What the survey says about income'],b:[
  {p:['JAOは、クロス・マーケティングに調査を委託し、2025年12月1日〜4日に調査しました。サイトやブログにアフィリエイト広告を載せている人のうち、スクリーニングの21,054人から、有効回答1,000人を集めた調査です。','The JAO commissioned Cross Marketing and ran the survey on 1–4 December 2025: 1,000 valid answers from site owners who run affiliate ads, drawn from 21,054 screened respondents.']},
  {table:{head:[['項目','Item'],['2013年','2013'],['2021年','2021'],['2023年','2023'],['2025年','2025']],rows:[
   [['月3万円以上','¥30,000+ per month'],['2.4%','2.4%'],['8.7%','8.7%'],['9.4%','9.4%'],['12.4%','12.4%']],
   [['月1,000円未満','Under ¥1,000 per month'],['—','—'],['68.6%','68.6%'],['66.2%','66.2%'],['52.5%','52.5%']]]}},
  {point:[['ポイント','Key point'],['月3万円以上の人の割合は、2013年の2.4%から**5倍以上**に増えました（JAOの表現）。月1,000円未満の人は、2023年より13.7ポイント減っています。','The share earning ¥30,000 or more a month has grown **more than five times** since 2013 (the JAO’s wording). The share under ¥1,000 is 13.7 points lower than in 2023.']]},
  {p:['そのほか、運営歴が5年以上の人は32.0%、1人あたりの運営サイト数は平均2.4でした。','Also, 32.0% have run their sites for five years or more, and the average is 2.4 sites per person.']},
  {warn:[['注意','Caution'],['これは「サイト運営者」への調査で、収入を保証するものではありません。年齢、職業、媒体、ジャンルなどの詳しい内訳は、JAO会員向けの報告書にあり、ここでは使っていません。','This is a survey of site owners and no guarantee of income. Breakdowns by age, occupation, channel and genre are in the members-only report and are not used here.']]}]});
 e.faq[0]=[['アフィリエイトは本当に稼げますか？','Can you really earn with affiliate marketing?'],['JAOの2025年調査では、月3万円以上の人は12.4%、月1,000円未満は52.5%でした。稼いでいる人はいますが、誰でも簡単に稼げるわけではありません。','In the JAO 2025 survey, 12.4% earned ¥30,000 or more a month and 52.5% under ¥1,000. Some people do earn, but it is not easy for everyone.']];
 e.matome=[['数字で見ると、約半数は月1,000円未満。ただし、月3万円以上の人は増えている。','About half earn under ¥1,000, but the share earning ¥30,000 or more is growing.'],['時間と手間をかけて運営している人ほど、収入が高い傾向がある。','People who put in more time and effort tend to earn more.'],['最初は表示回数とクリックを見て、書き直しながら続ける。','At first watch impressions and clicks, and keep rewriting.']];
 e.rel=['pick-niche','what-is-affiliate'];
 ad.lvl=1;ad.src=[];ad.log=[LG('初版を作成。出典の確認は今後の更新で追加。','First version. Sources will be added in later updates.')];ad.rel=['what-is-affiliate','earn-or-not'];
 tb.lvl=0;tb.src=[];tb.log=[LG('初版を作成。','First version.')];
 tb.rel=['sales-calendar','travel-demand'];
 pn.lvl=0;pn.src=[];pn.log=[LG('初版を作成。','First version.')];
})();

/* ---- new articles ---- */
A.push(
{id:'ai-seo',cat:'seo',icon:'search',read:7,lvl:1,
 kw:'AI検索 SEO / AIコンテンツ（提案キーワード）',
 t:['AI検索時代の旅行アフィリエイト記事：Googleが求める「人の確認」と独自性','Travel affiliate articles in the age of AI search: human review and originality'],
 eye:['AI検索とSEO','AI search & SEO'],
 s:['Googleは、AIで作った記事も**公開前に人が確認する**ことと、偽の専門家プロフィールを使わないことを求めています。リスト記事や比較記事は、価値を加えていれば問題になりません。人の確認と独自の体験が、AI時代の記事の土台です。','Google asks that AI-made articles be **reviewed by a person before publishing** and that fake expert profiles are not used. Listicles and comparisons are fine if they add value. Human review and original experience are the foundation of articles in the AI era.'],
 secs:[
 {h:['AI検索で何が起きているか','What is happening in AI search'],b:[
  {p:['GoogleのAI概要（AI Overviews）やAIモードなどのAI機能が、検索結果に出るようになりました。2026年8月には、サイトがこれらの機能への掲載から外れる設定も使えるようになりました。','Google’s AI features such as AI Overviews and AI Mode now appear in search results. In August 2026 a setting also became available that lets a site opt out of these features.']},
  {p:['サイラス・シェパード氏が、あるサイトで28日間オプトアウトして比べた実験では、AI機能での表示は全体のおよそ10%、クリック率は約0.9%（サイト全体は約0.4%）と推定されました。','In an experiment by Cyrus Shepard, a site opted out for 28 days and was then switched back. AI features accounted for about 10% of impressions, with a click-through rate of about 0.9% against about 0.4% site-wide.']},
  {warn:[['注意','Caution'],['これは1つのサイトの実験で、すでにAI向けに最適化していたサイトです。他のサイトに当てはまるとは限りません。','This is one site that had already optimised for AI. It does not necessarily apply elsewhere.']]}]},
 {h:['Googleが求めていること（2026年10月）','What Google asks for (October 2026)'],b:[
  {table:{head:[['テーマ','Topic'],['内容','What changed']],rows:[
   [['AI生成コンテンツ','AI-generated content'],['公開前に人が確認する。タイトル、メタディスクリプション、altテキストも含む','Have a person review it before publishing, including title, meta description and alt text']],
   [['偽の専門家','Fake experts'],['AIで作った顔写真、架空の名前、偽の資格のプロフィールは、欺瞞であり、品質の低いサインとされる','Profiles with AI photos, invented names or fake credentials count as deception and a low-quality signal']],
   [['主要コンテンツの評価','Main content'],['努力、独創性、技能、正確さの4つの観点で評価される','Judged on effort, originality, skill and accuracy']]]}},
  {p:['鈴木謙一さんのブログによると、日本語版のドキュメントは、この時点ではまだ更新されていません（記事は鈴木さんによる翻訳です）。','According to Kenichi Suzuki’s blog, the Japanese version of the documents had not been updated yet; the post relies on his own translation.']}]},
 {h:['リスト記事・比較記事は大丈夫？','Are listicles and comparisons safe?'],b:[
  {p:['2026年のSearch Central Live（バルセロナ）で、ジョン・ミューラー氏は、リスト記事（比較や「おすすめ」）はそれ自体がスパムではないが、**価値を加える必要がある**と話しました。',' At Search Central Live in Barcelona in 2026, John Mueller said listicles (comparisons and “best of” lists) are not spam in themselves, but **they need to add value**.']},
  {say:['リスト記事だけに頼る方法は、ある日急に通用しなくなることがある、とも言われています。**自分で行った体験や、確認した数字を足す**のがいちばん確実です。','He also said that a strategy built only on such lists can suddenly stop working. **Adding your own experience and numbers you have checked** is the safest route.']}]},
 {h:['当サイトの運用ルール','How this site works'],b:[
  {list:[['記事は、公開前に編集担当者が確認する','An editor reviews each article before publishing'],['架空の執筆者は使わない。運営は「ラボ編集部」と明記する','No invented authors; the operator is stated as the Lab editors'],['数字や主張には、記事の最後に出典と確認日を載せる','Numbers and claims get a source and a checked date at the end of the article'],['更新したら、更新履歴を残す','Keep an update log whenever an article changes'],['リスト・比較記事には、独自の観点や実際の確認を加える','Add original viewpoints or actual checks to lists and comparisons']]}]}],
 matome:[['AIで作った記事も、公開前に人が確認する。','Have a person review AI-made articles before publishing.'],['偽の専門家や架空の執筆者は使わない。','Don’t use fake experts or invented authors.'],['リスト・比較記事は、価値を加える。','Make lists and comparisons add value.']],
 faq:[
  [['AIで書いた記事は評価されませんか？','Are AI-written articles marked down?'],['鈴木さんの解説によると、Googleは、AIコンテンツを公開前に人が確認することを求めています。AIで作ったこと自体を禁じているわけではありません。','In Suzuki’s summary, Google asks for human review before publishing. It does not forbid using AI as such.']],
  [['AI概要に載ればアクセスは増えますか？','Will appearing in AI Overviews bring more traffic?'],['1つの実験では、AI機能でのクリック率はサイト全体の2倍以上と推定されましたが、サイトによって違う可能性があります。','In one experiment the click-through rate in AI features was estimated at more than double the site average, but it may differ by site.']]],
 src:['suzctr','suzmu','suzhr'],
 log:[LG('初版を作成。鈴木謙一さんのブログ（2026年10月〜11月の記事）にもとづく。Googleの一次ドキュメントは未確認。','First version based on Kenichi Suzuki’s posts (Oct–Nov 2026). Google’s primary documents are not yet checked.')],
 rel:['earn-or-not','travel-blog-income']},
{id:'sales-calendar',cat:'travel',icon:'ticket',read:9,lvl:0,
 kw:'旅行 セール / 航空券 セール（提案キーワード）',
 t:['旅行セール・キャンペーンの追い方：年末までのセールの見つけ方と記事の書き方','Following travel sales: how to find them and write about them'],
 eye:['旅行セールの追い方','Following travel sales'],
 s:['セール記事は、**セールの期間と旅行できる期間**をセットで書くと、読者の役に立ちます。期限が来たら更新するのが基本です。2026年11月時点では、各社の「11.11」や冬のセールが続いています。','For sale articles, give readers **the sale period and the travel period together**. Update the article once the sale ends. As of November 2026, “11.11” and winter sales are running.'],
 secs:[
 {h:['まず、2026年11月のセールを見てみる','A look at November 2026 sales'],b:[
  {h3:['11月上旬のセールを確認する','Checking the early-November sales']},
  {p:['TRAICYが伝えた、11月上旬のセールの例です。いずれも2026年11月9日に確認した内容で、**期限が過ぎると変わります**。','Examples reported by TRAICY in early November, checked on 9 November 2026. **They change once they expire.**']},
  {img:{src:'images/sales-calendar/01.jpg',alt:['空港のラウンジでスマートフォンのセール情報を確認する女性','A woman checking sale news on her smartphone in an airport lounge'],caption:['ニュースで速報を知り、期間と条件を確かめる','Learn of a sale from the news, then check its period and conditions']}},
  {p:['次の表は、セールごとに「いつまで買えるか」と「いつ旅行できるか」を分けて並べたものです。この2つは別の日付です。たとえばエティハド航空は、セールが11/8〜11/15で、旅行できるのは2026/11/16からです。','The table below separates “until when you can buy” from “when you can travel” for each sale. These are two different sets of dates. For example, the Etihad sale runs 8–15 Nov, while travel starts on 16 Nov 2026.']},
  {table:{head:[['セール','Sale'],['セール期間','Sale period'],['旅行できる期間','Travel period'],['内容','Details']],rows:[[['エティハド航空「11.11セール」','Etihad “11.11 sale”'],['11/8〜11/15','8–15 Nov'],['2026/11/16〜2027/5/31','16 Nov 2026 – 31 May 2027'],['東京・大阪発。基本運賃が最大22%オフ','From Tokyo and Osaka; up to 22% off the base fare']],
   [['ジェットスター・ジャパン「スーパースターセール」','Jetstar Japan “Super Star Sale”'],['11/6 12:00〜11/9 16:59','6 Nov 12:00 – 9 Nov 16:59'],['2026/11/23〜2027/2/18','23 Nov 2026 – 18 Feb 2027'],['国内16路線。片道3,690円から（各種手数料は別）','16 domestic routes; from ¥3,690 one way (fees extra)']],
   [['トキエア「冬タイムセール」','Toki Air “winter time sale”'],['11/6〜11/9','6–9 Nov'],['2026/12/1〜12/23','1–23 Dec 2026'],['片道、平日6,500円から・土日祝8,500円から（手数料は別）','One way from ¥6,500 on weekdays and ¥8,500 at weekends (fees extra)']],
   [['KLM「リアルディールデイズ」','KLM “Real Deal Days”'],['11/4〜11/24','4–24 Nov'],['2026/11/5〜2027/6/30','5 Nov 2026 – 30 Jun 2027'],['東京・大阪発の欧州線。往復177,680円から（エコノミー、アムステルダム）','Tokyo and Osaka to Europe; from ¥177,680 round trip (economy, Amsterdam)']]]}},
  {h3:['表の読み方：期間・条件・価格の単位','How to read the table: period, conditions and price units']},
  {p:['表を読むときは、まず**セール期間の終わり**を見ます。ジェットスター・ジャパンのように時刻まで決まっているセールもあります。次に、旅行できる期間と内容の条件を確認します。同じ「〜円から」でも、国内の片道と欧州の往復では意味が違います。','When reading the table, check the **end of the sale period** first. Some sales, like Jetstar Japan’s, even specify the time. Then check the travel period and conditions. “From ¥…” means something different for a domestic one-way fare and a round trip to Europe.']},
  {p:['KLMの例で考えてみます。セール期間は11/4〜11/24と長く、旅行できる期間も2026/11/5〜2027/6/30と広くなっています。一方、トキエアの旅行できる期間は2026/12/1〜12/23です。セールによって、読者が実際に旅行できる時期は大きく違います。','Take KLM as an example. The sale runs 4–24 Nov, and the travel period is wide, from 5 Nov 2026 to 30 Jun 2027. Toki Air, by contrast, allows travel only from 1 to 23 Dec 2026. The time readers can actually travel differs a lot from sale to sale.']},
  {point:[['ポイント','Key point'],['セール価格には、燃油サーチャージや空港使用料などが含まれない場合があります。「最安」とは書かず、「〜円から」と条件を添えます。','Sale prices may exclude fuel surcharges and airport fees. Don’t write “cheapest”; write “from ¥…” with the conditions.']]},
  {h3:['価格と条件の書き方','How to write prices and conditions']},
  {p:['トキエアの例では、平日と土日祝で価格が違います。記事に書くときは、安い方の価格だけを大きく見せないようにします。「平日6,500円から・土日祝8,500円から」のように、両方を書くと読者が迷いません。','In the Toki Air example, prices differ between weekdays and weekends. Don’t spotlight only the lower price in your article. Writing both, as in “from ¥6,500 on weekdays and ¥8,500 at weekends,” keeps readers from being confused.']},
  {p:['価格の書き方は、読者が予約しやすいかどうかに直結します。「片道」か「往復」か、発着地はどこか、クラスは何か。この点を価格のすぐ近くに書いておくと、読者は公式ページで同じ条件を探せます。条件が整理できたら、次は年末までの予定を見ていきます。','How you write a price directly affects how easily readers can book. State whether it is one way or round trip, where it departs from, and which class it is, right next to the price. Then readers can look for the same conditions on the official page. With conditions sorted, the next step is the schedule through year-end.']}]},
 {h:['年末にかけて追いたいテーマ','Themes to follow through year-end'],b:[
  {h3:['年末までの予定を先に押さえる','Know the year-end schedule in advance']},
  {p:['セールは、ニュースが出てから探すと遅れがちです。年末までの予定を先に押さえておくと、記事の準備ができます。次の表は、追いたいテーマとその時期をまとめたものです。','If you look for sales only after the news breaks, you tend to be late. Knowing the year-end schedule in advance lets you prepare articles. The table below lists themes worth following and their timing.']},
  {table:{head:[['テーマ','Theme'],['時期','Timing'],['出典','Source']],rows:[[['ふるさと納税・年末売れ筋サービス特集（帰省・旅行を含む）','Furusato Nozei and year-end features (including travel home)'],['2026/10/21〜12/2','21 Oct – 2 Dec 2026'],['A8スタッフブログ','A8 staff blog']],
   [['ブラックフライデー','Black Friday'],['2026年は11/27（金）が中心','Centred on Fri 27 Nov in 2026'],['A8スタッフブログ','A8 staff blog']],
   [['ANAとIHGの新プログラム','New ANA and IHG programme'],['2027年1月から（一部は2月から）','From January 2027 (partly February)'],['TRAICY','TRAICY']]]}},
  {h3:['時期の長さで記事の作り方を変える','Match the article to how long the theme lasts']},
  {p:['時期が長いテーマと短いテーマでは、記事の作り方が変わります。ブラックフライデーは2026年11/27（金）が中心なので、直前に公開するより早めに準備しておく方が安心です。ANAとIHGの新プログラムは2027年1月から（一部は2月から）なので、開始前の案内記事を書いておく方法もあります。','How you build an article depends on whether a theme is long or short. Black Friday is centred on Fri 27 Nov in 2026, so prepare early rather than publishing at the last moment. The new ANA and IHG programme starts in January 2027 (partly February), so you could write a preview article before it begins.']},
  {h3:['他社の特集は時期の参考にする','Use other companies’ features as a timing guide']},
  {p:['A8.netは競合ですが、季節ごとの特集は、日本のブロガーが「いつ何を紹介するか」を知る参考になります。','A8.net is a competitor, but its seasonal features show what Japanese bloggers promote and when.']},
  {p:['表の出典欄には、A8スタッフブログとTRAICYが並んでいます。A8スタッフブログの特集は、2026/10/21〜12/2のふるさと納税・年末売れ筋サービス特集と、11/27（金）が中心のブラックフライデーのように、時期の長さが違います。特集ごとに、どの時期に何を扱っているかを見比べると参考になります。','The source column lists the A8 staff blog and TRAICY. The A8 staff blog’s features differ in how long they run, such as the Furusato Nozei and year-end feature (21 Oct – 2 Dec 2026) and Black Friday, centred on Fri 27 Nov. Comparing what each feature covers and when is a useful guide.']},
  {p:['ここで大切なのは、真似をすることではなく、時期の感覚をつかむことです。特集の公開日を見ると、どれくらい前から準備しているかが分かります。自分の記事では、旅行に合う切り口を考えて書きます。','The point is not to copy but to get a sense of timing. A feature’s publication date shows how far ahead others prepare. In your own articles, choose an angle that fits travel.']},
  {list:[['時期が長いか、短いか（例：2026/10/21〜12/2と、11/27（金）が中心）','Is the timing long or short? (e.g. 21 Oct – 2 Dec 2026 versus centred on Fri 27 Nov)'],['旅行の話に結びつけられるか','Can it be linked to travel?'],['出典の公開日はいつか','When was the source published?'],['開始前に案内記事を書けるか（例：2027年1月からの新プログラム）','Can you write a preview before it starts? (e.g. the new programme from January 2027)']]}]},
 {h:['セール記事の書き方と、期限が来たときの更新','Writing sale articles and updating them when they end'],b:[
  {h3:['期限切れを防ぐ手順','Steps to prevent expired information']},
  {p:['セール記事で多い失敗は、期限が切れても「開催中」のまま残ることです。読者はその情報を信じて、終了したセールを探してしまいます。書くときから更新まで、次の4つの手順で進めると防げます。','A common mistake with sale articles is leaving “now on” after the sale has ended. Readers trust it and go looking for a sale that is over. Following the four steps below, from writing to updating, helps prevent this.']},
  {steps:[['記事の冒頭に、セール期間と旅行できる期間を書く','Put the sale period and the travel period at the top'],['価格は「〜円から」と書き、手数料が別かどうかを添える','Write prices as “from ¥…” and say whether fees are extra'],['期限の翌日に、記事を「終了」に更新する','Update the article to “ended” the day after the deadline'],['次のセールの記事にリンクする','Link to the next sale article']]},
  {img:{src:'images/sales-calendar/02.jpg',alt:['机でノートパソコンを使い、旅行記事を更新する男性','A man updating a travel article on a laptop at his desk'],caption:['期限の翌日に、記事の状態を更新する','Update the article’s status the day after the deadline']}},
  {p:['手順の中でも、冒頭の書き方が特に大切です。忙しい読者は最初の数行しか読まないことがあります。セール期間と旅行できる期間が最初にあれば、自分に合うかどうかをすぐ判断できます。','Of these steps, how you open the article matters most. Busy readers may read only the first few lines. If the sale period and travel period come first, they can quickly judge whether it suits them.']},
  {h3:['終了した記事の扱い','What to do with an ended article']},
  {p:['期限が過ぎた記事は、消さずに「終了しました」と明記して、次のセールへ案内します。','Don’t delete an expired article; mark it as ended and point readers to the next sale.']},
  {p:['消さずに残す理由は、検索から訪れる読者がいるからです。終了を明記した記事なら、読者はセールが終わったことをすぐ理解し、次のセールの案内へ進めます。記事を消してしまうと、その流れが途切れてしまいます。','The reason to keep it is that readers still arrive from search. If the article clearly says the sale has ended, readers understand at once and can move on to the next sale. Deleting the article breaks that path.']},
  {p:['次の例は、エティハド航空のセールを更新する場合です。変えるのは、セールの状態の書き方と日付の書き方、そして次への案内です。内容を消さずに残すので、記事の履歴も残ります。','The next example shows how to update the Etihad sale. What changes is the status, the way the date is written, and the pointer to what comes next. Because the content is kept, the article’s history stays intact.']},
  {diff:[['更新前：エティハド航空「11.11セール」を開催中（11/8〜11/15）','Before: Etihad “11.11 sale” is on (8–15 Nov)'],['更新後：エティハド航空「11.11セール」は11/15に終了しました。次は、年末年始のセールをチェック','After: The Etihad “11.11 sale” ended on 15 Nov. Next, check the year-end sales']]},
  {p:['更新するときは、記事の中にある日付を一か所ずつ見直します。冒頭だけを直して、表や本文に「開催中」が残る例はよくあります。更新のたびに記事を上から読み返すと、見落としを防げます。次の章では、こうした失敗をもう少し具体的に見ていきます。','When updating, review each date in the article one by one. It is common to fix only the opening and leave “now on” in a table or in the body. Reading the article from the top each time helps you avoid missing anything. The next section looks at such mistakes in more detail.']}]},
 {h:['セール記事でよくある失敗と防ぎ方','Common mistakes in sale articles and how to avoid them'],b:[
  {h3:['期間と時刻の書き間違い','Mistakes with dates and times']},
  {p:['いちばん多い失敗は、セール期間と旅行できる期間の混同です。エティハド航空の例では、セールは11/8〜11/15ですが、旅行できるのは2026/11/16からです。この2つを一つの期間のように書くと、読者は「11/15までに旅行する」と誤解してしまいます。','The most common mistake is mixing up the sale period and the travel period. In the Etihad example, the sale runs 8–15 Nov, but travel starts on 16 Nov 2026. If you write the two as one period, readers may think they must travel by 15 Nov.']},
  {p:['時刻の書き落としにも注意が必要です。ジェットスター・ジャパンのセールは、11/9 16:59までと時刻まで決まっていました。「11/9まで」とだけ書くと、夜に記事を読んだ読者が、すでに終わったセールを探すことになります。','Watch out for dropped times as well. Jetstar Japan’s sale was set down to the time, ending 9 Nov at 16:59. If you write only “until 9 Nov,” a reader who opens the article in the evening may go looking for a sale that has already ended.']},
  {list:[['セール期間の終わりに、時刻があるかどうか','Does the end of the sale period include a time?'],['旅行できる期間の始まりと終わり','The start and end of the travel period'],['セール期間と旅行できる期間を別の日付として書いたか','Did you write the sale period and travel period as separate dates?'],['冒頭・表・本文で日付がそろっているか','Do the dates match in the opening, tables and body?']]},
  {p:['公開の前にこの点を見るだけで、日付の間違いの多くは防げます。特に、表を使う記事では、冒頭の文章と表の日付がずれやすくなります。書き終えたら、冒頭から表、本文の順にもう一度読み合わせます。','Checking these points before publishing prevents most date errors. In articles with tables especially, the opening text and the table dates can drift apart. When you finish writing, read the opening, the table and the body against each other once more.']},
  {h3:['価格と条件の見せ方','How prices and conditions are shown']},
  {p:['KLMの「往復177,680円から」には、エコノミー、アムステルダム、東京・大阪発という条件がつきます。この条件を省いて「欧州往復が177,680円から」と書くと、すべての行き先が同じ価格のように読めてしまいます。条件は短くても必ず添えます。','KLM’s “from ¥177,680 round trip” comes with conditions: economy, Amsterdam, departing Tokyo or Osaka. If you drop them and write “Europe round trip from ¥177,680,” every destination seems to cost the same. Always add the conditions, even briefly.']},
  {p:['ジェットスター・ジャパンの「片道3,690円から」は、各種手数料が別です。価格のすぐあとに「手数料は別」と書いておけば、読者は予約画面で金額が増えても驚きません。国内16路線すべてが同じ価格ではない点も、「から」の一言で伝わります。','Jetstar Japan’s “from ¥3,690 one way” has fees on top. If you write “fees extra” right after the price, readers are not surprised when the amount rises on the booking screen. The word “from” also tells them that not all 16 domestic routes cost the same.']},
  {h3:['複数のセールをまとめるとき','When you cover several sales at once']},
  {p:['複数のセールを一つの記事にまとめると、終了日がばらばらになります。ジェットスター・ジャパンとトキエアは11/9、エティハド航空は11/15、KLMは11/24です。終了日ごとに更新が必要なので、表の行ごとに期限を書いておくと管理しやすくなります。','When one article covers several sales, the end dates differ: 9 Nov for Jetstar Japan and Toki Air, 15 Nov for Etihad and 24 Nov for KLM. Each end date needs its own update, so writing the deadline in every table row makes the article easier to manage.']},
  {img:{src:'images/sales-calendar/03.jpg',alt:['セール情報とメモを見比べて確認する女性','A woman comparing a sale announcement with her handwritten notes'],caption:['公開の前に、日付と条件を読み合わせる','Read dates and conditions against each other before publishing']}},
  {p:['失敗の多くは、情報が少ないからではなく、確認の順番が決まっていないことから起こります。次の章では、情報を集める順番を整理します。集め方が決まれば、書くときの迷いも減ります。','Most mistakes come not from a lack of information but from having no fixed order for checking it. The next section organises the order in which to collect information. Once the way of collecting is set, there is less hesitation when writing.']}]},
 {h:['ニュースの見つけ方','Where to find the news'],b:[
  {h3:['情報源を組み合わせて使う','Combine your sources']},
  {p:['セールの情報は、一つの場所だけでなく、複数の情報源を組み合わせて集めます。ニュースで速報を知り、公式サイトで条件を確かめる流れが基本です。次のリストは、目的ごとの使い分けです。','Collect sale information from several sources, not just one. The basic flow is to learn of a sale from the news and confirm conditions on the official site. The list below shows which source suits which purpose.']},
  {list:[['TRAICY：航空会社やホテルのセールの最新情報（毎日更新）','TRAICY: the latest airline and hotel sales (daily)'],['TravelVoice：旅行業界のニュースと統計','TravelVoice: travel industry news and statistics'],['A8スタッフブログ：季節の特集のスケジュール','A8 staff blog: seasonal feature schedule'],['各社の公式サイト：条件は必ず公式ページで確認','Official sites: always confirm conditions there']]},
  {h3:['毎日の確認の進め方','How to run the daily check']},
  {p:['毎日の確認は、更新の早いTRAICYから始めると効率的です。気になるセールが見つかったら、必ず公式ページで期間と条件を見直します。ニュースの記載と公式の内容が違う場合は、公式の内容を優先して書きます。','For daily checks, start with TRAICY, which updates quickly. When you find an interesting sale, always recheck the period and conditions on the official page. If the news and the official page differ, write according to the official page.']},
  {p:['記事を書くときは、どの情報源を、いつ確認したかをメモしておくと便利です。この記事でも「2026年11月9日に確認」と書いています。確認日が分かれば、あとで内容を見直すときに、どこまで確かめたかをすぐ思い出せます。','When writing, it helps to note which source you checked and when. This article, too, says “checked on 9 November 2026.” With a check date, you can quickly recall how far you verified when you review the content later.']}]},
 {h:['更新チェックリスト：タイミング別','Update checklist by timing'],b:[
  {h3:['タイミング別に見る','Looking at it by timing']},
  {p:['セール記事の更新は、公開前、期限の当日、期限の翌日、そして週に1回の見直しに分けて考えると、抜け漏れが減ります。次の表は、それぞれのタイミングで確認することと、使う情報源をまとめたものです。','Updating sale articles is easier to manage if you split it into before publishing, the deadline day, the day after the deadline and a weekly review. The table below summarises what to check at each moment and which source to use.']},
  {table:{head:[['タイミング','Timing'],['確認すること','What to check'],['使うもの','What to use']],rows:[[['公開前','Before publishing'],['セール期間（時刻を含む）、旅行できる期間、価格の条件','Sale period (including time), travel period, price conditions'],['TRAICYで速報を知り、公式ページで確認','Learn from TRAICY, confirm on the official page']],
   [['期限の当日','Deadline day'],['冒頭や表に、期限までの案内が分かりやすく書かれているか','Whether the opening and tables make the deadline clear'],['自分の記事','Your own article']],
   [['期限の翌日','Day after the deadline'],['記事を「終了」に更新し、次のセールへ案内する','Update to “ended” and point to the next sale'],['自分の記事と、次のセールの記事','Your article and the next sale article']],
   [['週に1回','Weekly'],['掲載中の項目の期限と価格が変わっていないか','Whether deadlines and prices of listed items have changed'],['各社の公式ページ','Official pages']]]}},
  {p:['表の中で特に見落としやすいのは、期限の当日です。この日は記事を直すのではなく、読者にとって分かりやすい状態かを確認する日です。更新そのものは翌日に行うので、当日と翌日の役割を分けておくと混乱しません。','The deadline day is the easiest row to overlook. On that day you are not rewriting the article but checking that it is clear for readers. The actual update happens the next day, so keeping the roles of the two days separate avoids confusion.']},
  {h3:['毎週の見直しの手順','The weekly review']},
  {p:['週に1回の見直しは、内容を確認する習慣として役立ちます。セールの期限が過ぎた項目は、翌日に更新します。まだ続いているセールは、公式ページで期間や価格が変わっていないかを見直します。','A weekly review works as a habit for checking content. Items whose sale has ended are updated the next day. For sales still running, recheck on the official page that the period and prices have not changed.']},
  {list:[['期限が過ぎた項目を探して「終了」に更新する','Find items past their deadline and update them to “ended”'],['続いているセールを公式ページで見直す','Recheck the sales still running on the official page'],['新しいセールを、TRAICYなどで確認する','Look for new sales on TRAICY and similar sources'],['確認した日付を記事に書き直す','Rewrite the check date in the article']]},
  {p:['この手順を毎回同じ順番で行うと、作業が短く済みます。慣れてくると、次に何をすればよいかで迷う時間も減ります。記事の信頼性は、こうした小さな見直しの積み重ねで保たれます。','Doing these steps in the same order each time keeps the work short. As you get used to it, you spend less time wondering what to do next. An article’s reliability is kept by this accumulation of small reviews.']},
  {img:{src:'images/sales-calendar/04.jpg',alt:['カフェでチェックリストを見ながら記事を見直す男性','A man reviewing a checklist and his article at a cafe'],caption:['週に1回、掲載中の項目を見直す','Review the listed items once a week']}},
  {p:['見直しの手順が決まっていれば、急なセールが出ても慌てずに対応できます。記事を更新するたびに、次に何を確認するかを書き残しておくのも一つの方法です。次の見直しで、前回の続きから始められます。','With a fixed review routine, you can respond calmly when a sudden sale appears. Another method is to write down what to check next each time you update. Then the next review can pick up where the last one left off.']},
  {h3:['年末までに備えること','What to prepare before year-end']},
  {p:['年末までは、ブラックフライデーは11/27（金）が中心、ANAとIHGの新プログラムは2027年1月から（一部は2月から）と、時期の違うテーマが並びます。それぞれに、公開する日と更新する日を先に決めておきます。','Through year-end, themes with different timing line up: Black Friday centred on Fri 27 Nov, and the new ANA and IHG programme starting in January 2027 (partly February). Decide in advance the publication day and the update day for each.']},
  {list:[['ブラックフライデー（11/27（金））の記事は、早めに準備する','Prepare the Black Friday (Fri 27 Nov) article early'],['ANAとIHGの新プログラムは、開始前の案内記事を書く','Write a preview of the new ANA and IHG programme before it starts'],['「11.11」などのセールは、期限の翌日に更新する','Update sales such as “11.11” the day after the deadline'],['終了した記事から、次のセールの記事へリンクする','Link from ended articles to the next sale article']]},
  {p:['セールを追うことは、情報を急いで出すことではなく、正確な情報を決まったタイミングで届けることです。期間と旅行できる期間をセットで書き、条件を添え、期限が来たら更新します。この流れを守れば、読者に頼られる記事になります。','Following sales is not about rushing information out but about delivering accurate information at fixed moments. Write the sale period and travel period together, add the conditions and update when the deadline passes. Keep to this flow and the article becomes one readers can rely on.']}]}],
 matome:[['セールは、セール期間と旅行できる期間をセットで書く。','Write the sale period and the travel period together.'],['価格は条件つきで。「最安」とは書かない。','Give prices with conditions; don’t write “cheapest”.'],['期限が来たら、消さずに「終了」へ更新する。','When it ends, update to “ended” instead of deleting.']],
 faq:[
  [['セール情報はどのくらいの頻度で更新しますか？','How often are sale articles updated?'],['週に1回、内容を確認しています。セールの期限が過ぎた項目は、翌日に更新します。','Content is checked weekly, and items whose sale has ended are updated the next day.']],
  [['記事の価格は、いつの時点のものですか？','As of when are the prices in the article?'],['記事の更新日の時点の情報です。価格は変わることがあるため、予約の前に、各社のページで最新の情報をご確認ください。','They are as of the article’s update date. Prices can change, so check each company’s page for the latest before booking.']],
  [['セール記事の冒頭には何を書けばよいですか？','What should go at the top of a sale article?'],['セール期間と旅行できる期間をセットで書きます。忙しい読者は最初の数行しか読まないことがあるため、この2つが最初にあれば、自分に合うかどうかをすぐ判断できます。','Write the sale period and the travel period together. Busy readers may read only the first few lines, so with these two at the top they can quickly judge whether it suits them.']],
  [['セールが終わった記事は、消したほうがよいですか？','Should I delete an article once the sale has ended?'],['消さずに「終了しました」と明記して、次のセールへ案内します。検索から訪れる読者が、終了を理解して次の情報へ進めます。','No. Mark it clearly as ended and point readers to the next sale. Readers arriving from search can then understand it has ended and move on to the next information.']],
  [['セールの価格は、どのように書けばよいですか？','How should I write sale prices?'],['「〜円から」と書き、片道か往復か、発着地、クラス、手数料が別かどうかを価格の近くに添えます。条件を省くと、すべてが同じ価格のように読めてしまいます。','Write “from ¥…” and add whether it is one way or round trip, the departure point, the class and whether fees are extra, right next to the price. Without conditions, everything can read as if it costs the same.']]],
 src:['tr1','tr2','tr3','tr4','tr5','a8yearend','a8bf'],
 log:[LG('初版を作成。TRAICYとA8スタッフブログの2026年11月9日時点の内容にもとづく。','First version based on TRAICY and the A8 staff blog as of 9 November 2026.'), ['2026-11-11',['解説の文章を追加','Added explanatory text'],['11段落を追加（モデル: anthropic/claude-sonnet-5.5）。表・手順・数字は変更なし。Added 11 explanatory paragraphs across all four sections using only the article\'s own figures and dates.','Added 11 paragraphs (model: anthropic/claude-sonnet-5.5). Tables, steps and figures unchanged.']], ['2026-11-11',['解説・図表・画像を追加して記事を拡充','Expanded the article with more explanation, tables and images'],['エディタ処理（anthropic/claude-sonnet-5.5）。本文2366→5627字、段落14→34、画像4点を追加。既存のブロック・数字は変更なし。参照: content/article-profile.json','Editor pass (anthropic/claude-sonnet-5.5). Text 2366→5627 chars, paragraphs 14→34, 4 images added. Existing blocks and figures unchanged. Profile: content/article-profile.json']]],
 rel:['travel-demand','travel-blog-income']},
{id:'travel-demand',cat:'market',icon:'chart',read:6,lvl:0,
 kw:'日本人 海外旅行 出国者数（提案キーワード）',
 t:['日本人の海外旅行は、どこまで戻った？最新の出国者数と、記事での使い方','How far has Japanese outbound travel recovered? The latest numbers and how to use them'],
 eye:['出国者数の最新データ','Outbound travel data'],
 s:['2026年9月の日本人出国者数は**148万1,900人**（前年同月比+6.3%）で、3か月ぶりに増えました。ただし2019年9月と比べると15.4%少なく、1〜9月累計も2019年比で25.6%少ない状況です。数字は毎月更新されます。','Japanese outbound travellers in September 2026 were **1,481,900** (+6.3% year on year), the first rise in three months. That is still 15.4% below September 2019, and January–September is 25.6% below 2019. The numbers update monthly.'],
 secs:[
 {h:['2026年9月の出国者数','Outbound travellers, September 2026'],b:[
  {table:{head:[['期間','Period'],['出国者数','Travellers'],['前年同期比','Year on year'],['2019年比','Versus 2019']],rows:[
   [['2026年9月','Sep 2026'],['1,481,900人','1,481,900'],['+6.3%','+6.3%'],['−15.4%（2019年9月は1,751,477人）','−15.4% (Sep 2019: 1,751,477)']],
   [['2026年1〜9月累計','Jan–Sep 2026'],['11,206,400人','11,206,400'],['+3.2%','+3.2%'],['−25.6%','−25.6%']]]}},
  {p:['9月に増えた理由は、7日間の連休（シルバーウィーク）があったことと説明されています。出典はJNTO（日本政府観光局）の発表を、TravelVoiceが図解したものです。','The rise is explained by a seven-day holiday stretch (Silver Week). The figures are the JNTO’s announcement as illustrated by TravelVoice.']}]},
 {h:['参考：訪日外客数と世界の動向','For reference: inbound visitors and the global picture'],b:[
  {table:{head:[['項目','Item'],['数字','Figure']],rows:[
   [['訪日外客数（2026年9月）','Inbound visitors, Sep 2026'],['3,103,700人（前年同月比−5.0%）','3,103,700 (−5.0% year on year)']],
   [['世界の国際宿泊旅行（2026年予測、WTM）','Global international overnight trips (2026 forecast, WTM)'],['15.7億回（前年比+2%）','1.57 billion (+2%)']],
   [['2027年の予測','2027 forecast'],['国際旅行が+8%','International trips +8%']]]}},
  {p:['WTMの調査では、**AIに予約まで任せてもよい人は36%**、AIをアイデア集めに使う人は53%、価格比較に使う人は58%でした。旅行のメディアにとって、AIが入口になりつつあることを示す数字です。','In the WTM survey, **36% would let AI complete a booking**, 53% use AI for ideas and 58% to compare prices. It shows AI becoming an entry point for travel media.']}]},
 {h:['記事で数字を使うときの注意','Using the numbers in articles'],b:[
  {list:[['必ず「何年何月の数字か」と出典を書く','Always state the month and the source'],['前年比と、コロナ前（2019年）比は、分けて書く','Keep year-on-year and versus-2019 figures separate'],['速報値は、あとで改訂されることがある','Preliminary figures can be revised later'],['一次情報（JNTO）を最終確認する','Finally check the primary source (JNTO)']]},
  {warn:[['注意','Caution'],['この記事の数字は、JNTO（日本政府観光局）の発表をTravelVoiceが報じた内容にもとづいています。最新の数字は、JNTOの発表もあわせてご確認ください。','The figures come from the JNTO’s announcement as reported by TravelVoice. For the latest numbers, also check the JNTO’s own release.']]}]},
 {h:['この記事の更新のしかた','How this article is updated'],b:[
  {p:['JNTOが月次の数字を公表したら、表の行を新しい月に差し替えます。更新したときは、更新履歴に日付と内容を残します。','When the JNTO publishes the next monthly figures, the table rows are replaced with the new month, and the date and change are added to the update log.']}]}],
 matome:[['2026年9月の出国者数は148万1,900人（+6.3%）。ただし2019年9月より15.4%少ない。','September 2026 outbound travellers: 1,481,900 (+6.3%), still 15.4% below September 2019.'],['数字は、月と出典を書いて使う。','Use numbers with the month and source.'],['毎月の公表後に更新する。','Update after each monthly release.']],
 faq:[
  [['この数字はいつ更新されますか？','When are these numbers updated?'],['毎月、JNTOの発表後に更新します。','Every month, after the JNTO’s release.']],
  [['旅行ブログに、統計は必要ですか？','Does a travel blog need statistics?'],['必須ではありません。ただ、最新の数字は記事の信頼性を高めます。','Not required, but up-to-date numbers raise an article’s credibility.']]],
 src:['tvout','tvin','tvwtm'],
 log:[LG('初版を作成。TravelVoiceの記事（2026年10月21日、11月6日）にもとづく。JNTOの一次ページは未確認。','First version based on TravelVoice articles (21 Oct and 6 Nov 2026). The JNTO primary page is not yet checked.')],
 rel:['sales-calendar','travel-blog-income','earn-or-not']}
);
A.forEach(function(a){if(!a.src)a.src=[];if(!a.log)a.log=[];if(a.lvl==null)a.lvl=0});
/* internal plan additions */
var P2=[
['15','広告表記とステマ規制','ステマ規制 アフィリエイト（提案）','—','launch','Claude提案。Asyaの表に無い。消費者庁・JAOの資料にもとづく','Claude proposal; not in Asya’s sheet; based on CAA and JAO'],
['16','AI検索時代の記事','AI検索 SEO（提案）','—','launch','Claude提案。鈴木謙一さんのブログ（二次情報）にもとづく','Claude proposal; based on Suzuki’s blog (secondary)'],
['17','旅行セールの追い方','旅行 セール（提案）','—','launch','Claude提案。週次で更新するタイプ（TRAICY）','Claude proposal; weekly-refresh type (TRAICY)'],
['18','日本人の出国者数','日本人 海外旅行 出国者数（提案）','—','launch','Claude提案。月次で更新するタイプ（JNTO）','Claude proposal; monthly-refresh type (JNTO)']
];
/* upcoming events for calendar page (sourced only) */
var EV=[
 ['2026-11-08','2026-11-15',['エティハド航空「11.11セール」','Etihad 11.11 sale'],'sale','tr1'],
 ['2026-11-04','2026-11-24',['KLM「リアルディールデイズ」','KLM Real Deal Days'],'sale','tr5'],
 ['2026-10-21','2026-12-02',['A8「ふるさと納税・年末売れ筋サービス特集」（帰省・旅行を含む）','A8 year-end features (incl. travelling home)'],'season','a8yearend'],
 ['2026-11-27','2026-11-27',['ブラックフライデー（A8の特集では11/27が中心）','Black Friday (A8 centres it on 27 Nov)'],'season','a8bf'],
 ['2026-12-09','2026-12-09',['JAO Japan Affiliate Summit 2026（13:00〜16:30、東京＋オンライン）','JAO Japan Affiliate Summit 2026 (13:00–16:30, Tokyo + online)'],'industry','jaosummit'],
 ['2026-12-07','2026-12-07',['Japan Affiliate Summit 2026 参加申込の締切（12:00）','Registration deadline for the Summit (12:00)'],'industry','jaosummit'],
 ['2026-12-15','2027-03-01',['Bing：AI利用の新しい制御設定への移行期間が始まる','Bing: migration to the new AI usage controls begins'],'seo','suzbing'],
 ['2027-01-01','2027-02-28',['ANAとIHGの新プログラムが順次開始（1月〜2月）','ANA and IHG programme rolls out (Jan–Feb)'],'travel','tr4']
];
var EVT={sale:['セール','Sale','#6d6d6d'],season:['需要期','Season','#636363'],industry:['業界','Industry','#5d5d5d'],seo:['SEO','SEO','#6b6b6b'],travel:['旅行','Travel','#5a5a5a']};
