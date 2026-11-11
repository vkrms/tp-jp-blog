/* Content. Every text is [ja, en]. **x** = marker highlight. Draft: sources not yet verified. */
var CATS=[
 {id:'basics',t:['アフィリエイト入門','Affiliate basics'],c:'#006dff'},
 {id:'traffic',t:['集客・広告','Traffic & ads'],c:'#d9480f'},
 {id:'strategy',t:['ジャンル・戦略','Niche & strategy'],c:'#8a4fff'},
 {id:'travel',t:['旅行ブログ','Travel blogging'],c:'#0a8f6a'},
];
var A=[
/* ---------- 1 ---------- */
{id:'what-is-affiliate',cat:'basics',icon:'book',read:6,
 kw:'アフィリエイト とは / 仕組み',
 t:['アフィリエイトとは？仕組みと始め方を初心者向けにやさしく解説','What is affiliate marketing? How it works and how to start, for beginners'],
 eye:['アフィリエイトとは？','What is affiliate?'],
 s:['アフィリエイトは、自分のサイトやSNSで商品・サービスを紹介し、読者がリンク経由で購入や登録をすると**報酬がもらえる仕組み**です。広告主、紹介する人、読者の3者で成り立ち、間にASPが入ることが多くあります。','Affiliate marketing is a system where you recommend products or services on your own site or social account and **earn a reward** when a reader buys or signs up through your link. It involves an advertiser, the person recommending, and the reader, and an ASP often sits in between.'],
 secs:[
 {h:['アフィリエイトの流れは5ステップ','The process in five steps'],b:[
  {p:['まず全体の流れをつかみましょう。細かい用語は後から覚えれば大丈夫です。','Start with the big picture. You can learn the terms later.']},
  {steps:[
   ['記事やSNS投稿で商品・サービスを紹介し、専用リンクを貼る','Recommend a product in an article or post and add your own link'],
   ['読者がリンクをクリックして、広告主のサイトへ移動する','A reader clicks the link and lands on the advertiser’s site'],
   ['読者が購入や会員登録などの「成果」につながる行動をする','The reader takes an action that counts as a result, such as buying or signing up'],
   ['広告主が内容を確認し、成果を承認する','The advertiser reviews the result and approves it'],
   ['承認された分の報酬が、あなたのアカウントに積み上がる','Approved rewards add up in your account']]},
  {say:['リンクを貼るだけで終わりではありません。「読者が何に困っていて、この商品でどう解決できるか」を書くことが、成果につながる一番の近道です。','Placing a link is not the end of it. Explaining what the reader struggles with and how the product helps is the shortest path to results.']}]},
 {h:['登場するのは3者。間に入るのがASP','Three parties, and the ASP in the middle'],b:[
  {p:['アフィリエイトには、広告主、アフィリエイター（紹介する人）、読者の3者が登場します。多くの場合、広告主とアフィリエイターのあいだに**ASP（アフィリエイトサービスプロバイダ）**が入り、広告の提供、成果の確認、報酬の支払いをまとめて担当します。','Three parties take part: the advertiser, the affiliate who recommends, and the reader. Usually an **ASP (affiliate service provider)** sits between advertiser and affiliate and handles ad supply, result tracking and payouts.']},
  {table:{head:[['登場人物','Party'],['役割','Role'],['例','Example']],rows:[
   [['広告主','Advertiser'],['商品やサービスを提供する会社','Company that offers the product or service'],['ホテル予約サイト、航空券サイトなど','Hotel booking sites, flight sites']],
   [['アフィリエイター','Affiliate'],['自分の媒体で商品を紹介する人','Person who recommends it on their own channel'],['ブロガー、YouTuber、SNS運用者','Bloggers, YouTubers, social media users']],
   [['読者','Reader'],['記事を読み、購入や登録をする人','Person who reads and buys or signs up'],['旅行の計画を立てている人','Someone planning a trip']],
   [['ASP','ASP'],['案件の提供、計測、支払いを担う事業者','Provides offers, tracking and payouts'],['アフィリエイトの運営会社','An affiliate network operator']]]}}]},
 {h:['報酬が発生するタイプ','How rewards are triggered'],b:[
  {p:['報酬の条件は大きく2種類です。どちらを採用するかは案件ごとに決まっているので、提携する前に必ず条件を確認します。','There are two main kinds. Each offer defines its own type, so always check the terms before you join.']},
  {table:{head:[['タイプ','Type'],['報酬が出る条件','When you are paid'],['特徴','Characteristic']],rows:[
   [['成果報酬型','Pay per result'],['購入、予約、会員登録などの成果','A purchase, booking or sign-up'],['1件あたりの報酬が大きいことが多い','Often a larger reward per result']],
   [['クリック報酬型','Pay per click'],['リンクがクリックされたとき','A click on your link'],['成果が出なくても報酬が発生する場合がある','May pay even without a purchase']]]}},
  {point:[['ポイント','Key point'],['「承認」されて初めて報酬が確定する案件が多くあります。表示される金額が、そのまま受け取れる金額とは限りません。','In many programs a reward is only final once it is approved. The amount you see is not always the amount you receive.']]}]},
 {h:['どこで発信する？媒体の選び方','Where to publish'],b:[
  {p:['ブログ、SNS、YouTube など、媒体によって強みが違います。自分が続けやすいものを選ぶのが基本です。','Blogs, social media and YouTube each have different strengths. Choose the one you can keep going with.']},
  {table:{head:[['媒体','Channel'],['強み','Strength'],['向いている人','Good for']],rows:[
   [['ブログ','Blog'],['検索から長く読まれやすい','Can be found through search for a long time'],['文章で詳しく説明するのが好きな人','People who like explaining in writing']],
   [['SNS','Social media'],['拡散しやすく、反応が早い','Spreads quickly and gives fast feedback'],['短い発信を毎日続けられる人','People who can post briefly every day']],
   [['YouTube','YouTube'],['体験や雰囲気が伝わりやすい','Conveys experience and atmosphere'],['撮影や編集が苦にならない人','People comfortable filming and editing']]]}}]},
 {h:['始める前のチェックリスト','Before you start'],b:[
  {list:[['扱うジャンルを1つ決めた','You picked one topic'],['発信する媒体を1つ決めた','You picked one channel'],['最初に書く記事のテーマを3つ決めた','You chose the first three article topics']]}]}],
 faq:[
  [['始めるのにお金はかかりますか？','Does it cost money to start?'],['登録が無料のASPは多くありますが、ブログ用のドメインやサーバーの費用がかかる場合があります。','Many ASPs are free to join, but a blog may need a domain and hosting.']],
  [['フォロワーやアクセスが少なくても始められますか？','Can I start with a small audience?'],['始められます。まずは、続けられる量の記事を書くところから始めましょう。','Yes. Start by writing a number of articles you can keep up with.']]],
 rel:['earn-or-not','pick-niche']},
/* ---------- 2 ---------- */
{id:'ad-affiliate',cat:'traffic',icon:'megaphone',read:7,
 kw:'アドアフィリエイト',
 t:['アドアフィリエイトとは？やり方と、赤字を避けるための考え方','Ad affiliate (アドアフィリエイト): how it works and how to avoid losing money'],
 eye:['アドアフィリエイト','Ad affiliate'],
 s:['アドアフィリエイトは、**広告費を使って集客し**、アフィリエイト報酬を得る手法です。結果が早く分かる反面、広告費が報酬を上回ると赤字になります。始める前に、損益の計算方法を知っておきましょう。','Ad affiliate means **paying for ads to bring traffic** and earning affiliate rewards. Results come fast, but you lose money if ad cost exceeds reward. Learn how to calculate profit before you start.'],
 secs:[
 {h:['アドアフィリエイトとは','What it is'],b:[
  {p:['広告媒体に広告を出し、その広告から紹介したい商品のページへ読者を案内します。広告費を負担するのは広告主ではなく、アフィリエイター自身です。','You place ads on an ad platform and send readers from them to the page of the product you promote. The affiliate, not the advertiser, pays for the ads.']},
  {p:['日本では「アドアフィリエイト」という言葉が一般的です。広告主が出す「アフィリエイト広告」とは立場が異なる点に注意してください。','In Japan the usual term is アドアフィリエイト. It is a different position from the “affiliate ads” (アフィリエイト広告) that advertisers run.']}]},
 {h:['記事型との違い','How it differs from article-based affiliate'],b:[
  {table:{head:[['','' ],['記事で集客','Articles'],['広告で集客','Ads']],rows:[
   [['最初の費用','Upfront cost'],['ほぼ時間のみ','Mostly time'],['広告費が必要','Ad spend required']],
   [['結果が出るまで','Time to results'],['時間がかかる','Slower'],['早く分かる','Faster']],
   [['主なリスク','Main risk'],['読まれない','Not being read'],['広告費が報酬を上回る','Ad cost exceeds reward']],
   [['続け方','How it continues'],['記事が資産として残る','Articles remain as assets'],['広告を止めると流入も止まる','Traffic stops when ads stop']]]}}]},
 {h:['基本の流れ','The basic flow'],b:[
  {steps:[
   ['紹介する案件を選び、提携を申請する','Choose an offer and apply to join'],
   ['広告と、読者が最初に見るページを用意する','Prepare the ad and the page readers see first'],
   ['少額で出稿し、クリックと成果を記録する','Run a small budget and record clicks and results'],
   ['数字を見て、続けるか止めるかを決める','Decide from the numbers whether to continue or stop']]}]},
 {h:['損益の考え方：仮の数字で計算してみる','Profit and loss: a worked example with made-up numbers'],b:[
  {p:['必要なのは3つの数字です。**クリック単価**、**成果率**、**1件あたりの報酬**。次の数字は説明のための仮の例で、実際の数字ではありません。','You need three numbers: **cost per click**, **conversion rate** and **reward per result**. The figures below are made up for explanation and are not real data.']},
  {table:{head:[['項目','Item'],['仮の数字','Example'],['計算','Calculation']],rows:[
   [['クリック単価','Cost per click'],['50円','¥50'],['—','—']],
   [['100クリックの広告費','Ad cost for 100 clicks'],['5,000円','¥5,000'],['50円 × 100','¥50 × 100']],
   [['成果率','Conversion rate'],['2%','2%'],['100クリック中2件','2 of 100 clicks']],
   [['1件あたりの報酬','Reward per result'],['3,000円','¥3,000'],['—','—']],
   [['報酬の合計','Total reward'],['6,000円','¥6,000'],['3,000円 × 2件','¥3,000 × 2']],
   [['差し引き','Net'],['+1,000円','+¥1,000'],['6,000円 − 5,000円','¥6,000 − ¥5,000']]]}},
  {say:['成果率が2%から1%に下がると、報酬は3,000円になって2,000円の赤字です。**成果率の小さな差が、損益を大きく動かします。**','If the rate drops from 2% to 1%, the reward is ¥3,000 and you are ¥2,000 down. **A small change in conversion rate moves profit a lot.**']}]},
 {h:['小さく試して、やめる基準を先に決める','Test small and set a stop rule first'],b:[
  {p:['最初は少額で出稿し、1週間単位で数字を見ます。「広告費がいくらを超えたら止める」を、始める前に決めておくと、損失が広がりません。','Start with a small budget and review the numbers weekly. Deciding beforehand “I stop when the ad cost passes this amount” keeps losses contained.']}]}],
 faq:[
  [['初心者でもできますか？','Can beginners do it?'],['できますが、広告費が先に出ていくため、少額から始めることをおすすめします。','Yes, but ad spend goes out first, so start with a small amount.']],
  [['アフィリエイト広告とは違うのですか？','Is it the same as “affiliate ads”?'],['違います。アフィリエイト広告は広告主が出す広告を指すことが多く、アドアフィリエイトはアフィリエイター自身が広告費を負担する手法です。','No. “Affiliate ads” usually means ads an advertiser runs. Ad affiliate is the method in which the affiliate pays for ads.']],
  [['どの広告媒体を使えばよいですか？','Which ad platform should I use?'],['読者の層に合う媒体を選び、少額から試します。費用と反応を見て、続けるかどうかを決めます。','Choose a platform that fits your readers and test with a small budget; decide whether to continue from the cost and the response.']]],
 rel:['what-is-affiliate','earn-or-not','pick-niche']},
/* ---------- 3 ---------- */
{id:'earn-or-not',cat:'strategy',icon:'chart',read:6,
 kw:'アフィリエイト 稼げない / 稼げる / やめとけ',
 t:['アフィリエイトは稼げない？そう言われる理由と、続けている人の共通点','Is affiliate marketing a dead end? Why people say so, and what keeps people going'],
 eye:['稼げない？','A dead end?'],
 s:['「稼げない」と言われる主な理由は、**読者の疑問に答えていない記事**、更新が続かないこと、ジャンル選びのずれの3つです。どれも始めた後に見直せます。続けている人は、数字を見て記事を直しています。','The usual reasons behind “you can’t earn” are **articles that don’t answer readers’ questions**, irregular updates and a poorly chosen topic. All three can be fixed after you start. People who continue review their numbers and rewrite.'],
 secs:[
 {h:['なぜ「稼げない」と検索されるのか','Why people search for “can’t earn”'],b:[
  {p:['始めたものの成果が出ず、やめてしまう人は少なくありません。そうした声が多いため、検索でも否定的な言葉が目立ちます。ただし、理由を分けて見ると、対策できるものがほとんどです。','Many people start, see no results and quit, so negative wording is common in search. But when you separate the reasons, most can be addressed.']},
  {table:{head:[['よくある理由','Common reason'],['起きていること','What happens'],['見直し方','How to fix it']],rows:[
   [['記事が読者の疑問とずれている','Articles miss readers’ questions'],['検索されない、読まれても離脱される','Not found, or readers leave'],['検索結果の上位記事を読み、足りない情報を探す','Read the top results and find what is missing']],
   [['更新が続かない','Updates stop'],['記事が増えず、評価が育たない','Too few articles to build trust'],['1週間に書ける量を決めて、小さく続ける','Set a weekly amount you can sustain']],
   [['ジャンルが合っていない','Wrong topic'],['書くこと自体が苦しくなる','Writing becomes a chore'],['好き・詳しい・需要の3つで選び直す','Re-pick using interest, expertise and demand']],
   [['成果が出る前にやめる','Quitting too early'],['検索経由の評価は時間がかかる','Search trust takes time'],['数ヶ月単位で数字を見る','Review over months, not days']]]}}]},
 {h:['成果が出るまでの時間','How long results take'],b:[
  {p:['検索から読まれる記事は、公開してすぐには評価されません。短期間の収益だけで判断せず、記事ごとの表示回数とクリックを見て改善していきます。','An article found through search is not rewarded the moment it is published. Instead of judging by short-term income, review impressions and clicks per article and improve from there.']},
  {point:[['ポイント','Key point'],['収益の前に、まず「表示回数」と「クリック」を見ます。収益は、その結果として後からついてきます。','Look at impressions and clicks before income. Income follows as a result.']]}]},
 {h:['続けている人がしていること','What people who continue do'],b:[
  {list:[['読者の質問に、具体的に答えている','They answer readers’ questions specifically'],['自分の体験を入れて、ほかの記事との違いを出している','They add personal experience to stand out'],['公開後も、数字を見て記事を書き直している','They rewrite articles after publishing, guided by numbers'],['複数のことを一度に始めず、1つずつ試している','They test one thing at a time']]},
  {say:['最初の記事で成果が出ないのは、ごく普通のことです。**書き直せる前提で、まず公開する**ほうが前に進めます。','It is completely normal for the first article to bring no results. **Publish with the expectation of rewriting** and you move forward faster.']}]},
 {h:['数字で振り返る：見る指標','Reviewing by numbers: what to look at'],b:[
  {table:{head:[['指標','Metric'],['意味','Meaning'],['低いときに疑うこと','If it is low']],rows:[
   [['表示回数','Impressions'],['検索結果に表示された回数','How often the page appeared in search'],['キーワードや記事のテーマが合っていない','Keyword or topic mismatch']],
   [['クリック率','Click-through rate'],['表示された中で、クリックされた割合','Share of impressions that were clicked'],['タイトルや説明文が魅力的でない','Title or description is unappealing']],
   [['リンクのクリック','Link clicks'],['記事内のリンクが押された回数','How often your in-article link was pressed'],['リンクの位置や、前後の説明が弱い','Weak link placement or lead-in']],
   [['成果','Results'],['購入や登録など','Purchases or sign-ups'],['紹介する商品と読者の目的が合っていない','Product and reader intent do not match']]]}}]},
 {h:['立ち止まって見直すタイミング','When to pause and rethink'],b:[
  {warn:[['注意','Caution'],['広告費の持ち出しが続く場合や、本業や生活に支障が出ている場合は、いったん立ち止まって方法を見直してください。無理に続ける必要はありません。','If ad costs keep exceeding income or it is affecting your job or daily life, pause and rethink. There is no need to push through.']]}]}],
 faq:[
  [['アフィリエイトは本当に稼げますか？','Can you really earn with affiliate marketing?'],['成果を出している人はいますが、誰でも簡単に稼げるわけではありません。収益は、ジャンル、記事の質、続けた期間などで大きく変わります。','Some people do, but it is not easy for everyone. Income varies greatly with topic, article quality and how long you keep going.']],
  [['どのくらい続ければ成果が見えますか？','How long until I see results?'],['一概には言えません。数ヶ月単位で、表示回数やクリックの変化を見ることをおすすめします。','It varies. Watch the change in impressions and clicks over a few months.']],
  [['「やめとけ」と言われるのはなぜですか？','Why do people say “don’t do it”?'],['成果が出る前にやめた人の声が多いことと、誇大な宣伝への警戒が背景にあります。冷静に条件を確認することが大切です。','Partly because many people quit before results, and partly wariness about exaggerated promotion. Check the conditions calmly.']]],
 rel:['pick-niche','what-is-affiliate','ad-affiliate']},
/* ---------- 4 ---------- */
{id:'pick-niche',cat:'strategy',icon:'compass',read:6,
 kw:'アフィリエイト ジャンル / 稼げるジャンル',
 t:['アフィリエイトのジャンルの選び方：好き・詳しい・需要で決める','How to choose an affiliate topic: interest, expertise and demand'],
 eye:['ジャンルの選び方','Choosing a topic'],
 s:['ジャンルは、**好きなこと、詳しいこと、検索されていること**の3つが重なるところから選ぶと続けやすくなります。日本では「ニッチ」より「ジャンル」という言葉が一般的です。','Choose a topic where **what you like, what you know and what people search for** overlap, and it is easier to keep going. In Japan the usual word is ジャンル (genre), not ニッチ.'],
 secs:[
 {h:['まず「ジャンル」の意味をそろえる','First, the word ジャンル'],b:[
  {p:['日本では、記事やサイトで扱う分野を「ジャンル」と呼びます。「ニッチ」は、競合の少ない小さな市場という別の意味で使われることが多く、ジャンルの言い換えにはなりません。','In Japan the field an article or site covers is called ジャンル. ニッチ usually means a small market with few competitors, so it is not a substitute for ジャンル.']}]},
 {h:['3つの軸で候補を出す','Shortlist with three questions'],b:[
  {steps:[
   ['好き：その話題なら、毎週書いても飽きないか','Interest: could you write about it every week without getting bored?'],
   ['詳しい：自分の体験や知識を、記事に入れられるか','Expertise: can you put your own experience or knowledge into articles?'],
   ['需要：その話題を、検索している人がいるか','Demand: do people actually search for it?']]},
  {point:[['ポイント','Key point'],['3つのうち1つでも欠けると、続かないか、読まれないかのどちらかになりがちです。','Missing even one of the three usually means you either stop or are not read.']]}]},
 {h:['候補を表で比べる','Compare candidates in a table'],b:[
  {p:['気になるジャンルを3つほど挙げて、次のように比べます。評価は自分の感覚で構いません（以下は書き方の例です）。','List about three candidate topics and compare them like this. Your own judgement is fine (the table below is an example of how to fill it in).']},
  {table:{head:[['ジャンル（例）','Topic (example)'],['好き','Interest'],['詳しさ','Expertise'],['需要','Demand'],['競合','Competition']],rows:[
   [['国内旅行','Domestic travel'],['◎','◎'],['○','○'],['◎','◎'],['強い','Strong']],
   [['海外ひとり旅','Solo trips abroad'],['◎','◎'],['◎','◎'],['○','○'],['中くらい','Medium']],
   [['登山・アウトドア','Hiking and outdoors'],['○','○'],['△','△'],['○','○'],['中くらい','Medium']]]}}]},
 {h:['単価と競合を見る','Check payout and competition'],b:[
  {p:['報酬の単価が高くても、競合が強ければ上位表示は簡単ではありません。検索結果の上位を実際に開き、**自分にしか書けない切り口があるか**を確認します。','A high payout does not help if competition is strong. Open the top results and check **whether you have an angle only you can write**.']},
  {say:['「穴場ジャンル」という検索もよく見られます。ただ、誰かが「穴場」と紹介した時点で、競合は増えていきます。**自分の経験で差をつけられるか**のほうが大切です。','“Hidden-gem topic” (穴場ジャンル) is a common search too. But once someone calls a topic a hidden gem, competition grows. **Whether you can stand out with your own experience** matters more.']}]},
 {h:['旅行ジャンルの強み','Why travel is a good fit'],b:[
  {p:['旅行は、宿泊、航空券、現地のアクティビティなど、体験とセットで紹介しやすい商品が多いジャンルです。実際に行った場所の記事は、ほかのサイトとの違いにもなります。','Travel has many products that pair easily with experience: stays, flights, local activities. Articles about places you actually visited also set you apart from other sites.']}]},
 {h:['慎重に考えたいジャンル','Topics to approach with care'],b:[
  {warn:[['注意','Caution'],['健康や金融など、読者の生活に大きく影響する分野では、専門的な知識が必要になる場合があります。扱うかどうかは、自分が責任を持って書けるかで慎重に決めてください。','Fields such as health or finance can seriously affect readers’ lives and may require real expertise. Decide carefully whether you can write about them responsibly.']]}]}],
 faq:[
  [['複数のジャンルを同時に扱ってもいいですか？','Can I cover several topics at once?'],['最初は1つに絞るほうが、記事の評価も学びも積み上がりやすくなります。','Start with one so that both your articles’ standing and your learning build up.']],
  [['需要はどうやって調べますか？','How do I check demand?'],['検索候補や、キーワードを調べるツールで確認できます。数字は目安として見てください。','Search suggestions and keyword research tools help. Treat the numbers as a guide.']],
  [['途中でジャンルを変えてもいいですか？','Can I change topic later?'],['変えられます。ただ、これまでの記事が評価されている場合は、新しいジャンルは別のサイトや媒体に分けることも考えます。','Yes, but if your existing articles are doing well, consider putting the new topic on a separate site or channel.']]],
 rel:['travel-blog-income','earn-or-not','what-is-affiliate']},
/* ---------- 5 ---------- */
{id:'travel-blog-income',cat:'travel',icon:'plane',read:7,
 kw:'旅しながら稼ぐ / 旅行ブログ',
 t:['旅行ブログの収益化、最初の一歩：体験記と比較記事で始める','Monetising a travel blog: start with trip reports and comparison posts'],
 eye:['旅行ブログで収益化','Travel blog income'],
 s:['旅行ブログは、宿泊や航空券、現地アクティビティの紹介と相性がよく、**実体験の記事がそのまま収益につながります**。まず「体験記」と「比較記事」の2種類から始めます。','A travel blog pairs well with hotels, flights and local activities, and **first-hand posts can lead directly to income**. Start with two kinds of post: trip reports and comparisons.'],
 secs:[
 {h:['旅行ブログと収益化の相性','Why travel blogs and monetisation fit'],b:[
  {p:['旅行は「どこへ行くか」「どこに泊まるか」「どう行くか」と、予約が必要な場面が多く、記事の中に自然にリンクを置きやすいジャンルです。','Travel involves many booking moments: where to go, where to stay, how to get there. Links fit naturally into the articles.']}]},
 {h:['まず書く2種類の記事','The first two kinds of post'],b:[
  {table:{head:[['記事のタイプ','Type'],['役割','Role'],['読まれる場面','When it is read'],['例','Example']],rows:[
   [['体験記','Trip report'],['信頼をつくる','Builds trust'],['行き先を探している途中','While choosing a destination'],['「京都2泊3日で歩いたルート」','“Our 3-day walking route in Kyoto”']],
   [['比較記事','Comparison'],['予約の背中を押す','Pushes toward booking'],['予約する直前','Just before booking'],['「京都駅周辺の宿を比べてみた」','“Comparing stays near Kyoto Station”']]]}},
  {say:['体験記で「この人の話は信用できる」と思ってもらい、比較記事で「ここで予約しよう」と決めてもらう。**2つが同じサイトにあると、読者が迷わずに進めます。**','A trip report makes readers think “this person is credible”, and a comparison helps them decide “I’ll book here”. **With both on one site, readers move on without getting lost.**']}]},
 {h:['紹介できる旅行商品','Travel products you can recommend'],b:[
  {list:[['宿泊（ホテル、旅館、民泊など）','Accommodation (hotels, ryokan, rentals)'],['航空券、鉄道、バスなどの移動','Flights, trains, buses'],['現地ツアーやアクティビティ','Local tours and activities'],['レンタカー、空港送迎','Car rental, airport transfers'],['旅行保険、eSIMなど、旅の準備に使うもの','Travel insurance, eSIM and other trip preparation']]}]},
 {h:['リンクを置く場所の考え方','Where to place links'],b:[
  {steps:[
   ['読者が「ここで予約したい」と思う場面を探す','Find the moment where a reader would want to book'],
   ['その直前に、理由を一文で説明する','Explain the reason in one sentence just before'],
   ['リンクは、文章の中と、記事の最後に置く','Place the link in the text and at the end of the article']]}]},
 {h:['最初の10記事の作り方','Your first ten posts'],b:[
  {list:[['体験記：行ってきた場所を3本','Three trip reports about places you visited'],['比較記事：宿、移動手段、プランを3本','Three comparisons of stays, transport or plans'],['準備記事：持ち物、予約の手順、注意点を2本','Two preparation posts: packing, booking steps, cautions'],['まとめ記事：目的地ごとの記事をまとめる1本','One hub post linking your destination articles'],['自己紹介記事：どんな旅をしている人かを1本','One about-me post on what kind of traveller you are']]}]},
 {h:['Travelpayouts でできること','What Travelpayouts offers'],b:[
  {p:['Travelpayouts は、複数の旅行ブランドのアフィリエイトプログラムを、ひとつのプラットフォームで利用できるサービスです。登録は無料です。当サイトは Travelpayouts が運営しています。','Travelpayouts lets you use the affiliate programs of several travel brands on one platform. Registration is free. This site is published by Travelpayouts.']}]}],
 faq:[
  [['写真や体験談は必要ですか？','Do I need photos and personal stories?'],['必須ではありませんが、自分で行って書いた記事は信頼されやすく、ほかのサイトとの違いにもなります。','Not required, but posts based on your own trips are trusted more and set you apart.']],
  [['旅行に行かなくても書けますか？','Can I write without travelling?'],['書けますが、調べた情報のまとめだけでは、似た記事が多くなりがちです。自分の経験や視点を足すことをおすすめします。','You can, but summaries of researched information tend to look like many others. Adding your own experience or viewpoint helps.']],
  [['ブログとSNS、どちらから始めればよいですか？','Blog or social media first?'],['どちらでも構いません。続けやすいほうを選び、慣れたらもう一方を足していきます。','Either. Pick the one you can maintain and add the other once you are comfortable.']]],
 rel:['pick-niche','what-is-affiliate']},
/* ---------- 6 ---------- */
];
/* Glossary: g = [ja term, en term, ja definition, en definition, kind]  kind: gen = general affiliate term, tp = Travelpayouts-specific */
var G=[
['アフィリエイト','Affiliate marketing','自分の媒体で商品を紹介し、成果に応じた報酬を得る仕組み。','Recommending products on your own channel and earning a reward based on results.','gen'],
['ASP','ASP','広告主とアフィリエイターを仲介し、案件の提供、計測、報酬の支払いを担う事業者。','A service connecting advertisers and affiliates that handles offers, tracking and payouts.','gen'],
['案件','Offer (案件)','アフィリエイトで紹介できる広告やプログラムの総称。','A general word for an ad or program you can promote as an affiliate.','gen'],
['成果報酬型','Pay per result (CPA)','購入や登録などの成果に対して報酬が支払われる方式。','Rewards are paid for results such as purchases or sign-ups.','gen'],
['クリック報酬型','Pay per click (CPC)','リンクのクリック数に応じて報酬が支払われる方式。','Rewards are paid by the number of link clicks.','gen'],
['アドアフィリエイト','Ad affiliate','広告を出稿して集客し、アフィリエイト報酬を得る手法。','Paying for ads to bring traffic and earning affiliate rewards.','gen'],
['承認','Approval','広告主が成果の内容を確認し、報酬を確定させること。','The advertiser confirms a result and finalises the reward.','gen'],
['コンバージョン（成果）','Conversion','購入、予約、会員登録など、目的とする行動が行われること。','A target action such as a purchase, booking or sign-up.','gen'],
['クリック率（CTR）','Click-through rate','表示された回数のうち、クリックされた割合。','The share of impressions that were clicked.','gen'],
['導線','Reader path (導線)','読者が記事から購入や登録までたどる道筋。','The path a reader follows from an article to a purchase or sign-up.','gen'],
['ジャンル','Topic / genre','扱うテーマの分野。日本では「ニッチ」より一般的な言い方。','The field you cover. In Japan more common than ニッチ.','gen'],
['媒体','Channel (媒体)','記事やリンクを掲載する場所。ブログ、SNS、YouTube など。','Where you publish content and links: blog, social, YouTube and so on.','gen'],
['集客','Traffic acquisition','サイトやSNSに読者を呼び込むこと。','Bringing readers to your site or account.','gen'],
['コンテンツサイト','Content site','記事や写真などを定期的に更新する、情報提供が中心のサイト。','A site focused on information, with regularly updated articles and photos.','gen'],
['ディープリンク','Deep link','サイトのトップではなく、特定の商品や条件が入力されたページへ直接つなぐリンク。','A link that goes straight to a specific page, such as one with the route and dates already filled in.','gen'],
['パートナー','Partner','Travelpayouts に登録し、自分の媒体で収益化する人。当サイトでは、Travelpayouts のユーザーをこう呼ぶ。','A person registered with Travelpayouts who monetises their own channel. The term this site uses for Travelpayouts users.','tp'],
['旅行ブランド','Travel brand','Travelpayouts のプラットフォームで利用できる、旅行会社やサービスのプログラム。','A travel company’s or service’s program available on the Travelpayouts platform.','tp'],
['パートナーリンク','Partner link','パートナー専用のIDが入ったリンク。このリンク経由の予約が、そのパートナーの成果として記録される。','A link that carries the partner’s own ID so bookings through it are credited to that partner.','tp'],
['報酬','Reward','パートナーが成果に対して受け取る収入。「手数料」「コミッション」ではなく、この言葉を使う。','The income a partner earns for results. Used instead of “fee” or “commission”.','tp'],
['Sub ID','Sub ID','リンクごと、またはトラフィックの出どころごとに、クリックと成果を分けて見るための追加パラメータ。','An extra parameter that lets you see clicks and results separately per link or traffic source.','tp'],
['Cookie有効期間','Cookie lifetime','クリックの記録がブラウザに残る期間。この間に行われた予約が、パートナーの成果になる。','How long a click is remembered in the browser. Bookings made within that period are credited to the partner.','tp'],
['ウィジェット','Widget','検索フォームなど、サイトに埋め込んで使うパーツ。','An embeddable element such as a search form.','tp'],
['ホワイトラベル','White label','航空券・ホテル検索を、自分のサイトのデザインで表示する仕組み。','A way to show flight and hotel search in your own site’s design.','tp'],
['ポストバック','Postback','予約の成立やキャンセルを通知するための仕組み。','A notification mechanism for completed or cancelled bookings.','tp'],
['メタサーチ','Metasearch','複数のサイトの検索結果を集めて、比べて表示する検索サービス。','A search service that gathers results from many sites and shows them side by side.','tp'],
['紹介プログラム','Referral program','ほかの人を Travelpayouts に紹介して、追加の報酬を得る仕組み。','A way to earn extra by referring other people to Travelpayouts.','tp']
];
/* Internal term map: RU rule (from Confluence glossary / ToV) -> JP use on site. status always needs native check. */
var TM=[
['партнёр (публичный термин), «аффилиат» — внутренний','パートナー','Для Travelpayouts-пользователей. В общих статьях про отрасль допустимо «アフィリエイター», это слово ищут читатели.','Проверить Кадай/Локол'],
['вознаграждение / commission: в TP Messagings (окт. 2026) для внешнего маркетинга разрешено «commission», «reward rate» — только при цитировании интерфейса','報酬（手数料・コミッションは使わない）','В японском рынке стандартный термин — 成果報酬/報酬. «手数料» читается как плата с партнёра. Расходится с англ. правилом — решить с Асей/носителем.','Нужно решение'],
['бренд / тревел-бренд, не «рекламодатель»','旅行ブランド','В общих статьях про ASP «広告主» нужен как отраслевой термин.','Проверить Кадай/Локол'],
['программа, не «оффер»','プログラム','«案件» используем только как общее отраслевое слово, а про бренды Travelpayouts пишем «プログラム».','Проверить Кадай/Локол'],
['партнёрская ссылка','パートナーリンク','Кандидат, в японском интерфейсе может быть другое слово.','Сверить с японским ЛК'],
['affiliate dashboard, не «personal account»','アフィリエイトダッシュボード / 管理画面','Кандидат.','Сверить с японским ЛК'],
['не использовать «PPCアフィリエイト» для клик-программ','クリック報酬型','В Японии «PPCアフィリエイト» значит покупку поисковой рекламы.','По таблице Аси'],
['«нарушение», не «фрод» в общении с партнёрами','（記事では扱わない）','Тема не нужна в блоге на старте.','—']
];
