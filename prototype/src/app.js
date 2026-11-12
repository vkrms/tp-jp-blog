var L='ja';
try{var s0=localStorage.getItem('lang');if(s0==='en'||s0==='ja')L=s0}catch(e){}
var PROTO=true; /* prototype-only banner and Internal page: set to false / delete for production */
var KEY='https://landings.travelpayouts.com/?tp_place=landing_jp-seo-blog';
var X=function(a){return L==='ja'?a[0]:a[1]};
var T={
 by:['Travelpayouts が運営する旅行アフィリエイト情報サイト','Travel affiliate know-how, by Travelpayouts'],
 banner:['MVP 試作版：記事は下書きで、出典の確認とネイティブチェックはこれからです。','MVP prototype: articles are drafts; sources and native-speaker review are still pending.'],
 tkl:['お知らせ','NEWS'], tk:['新着：2026年11月の旅行セールの追い方','New: how to follow the November 2026 travel sales'],
 nav:[['home','ホーム','Home'],['articles','記事一覧','Articles'],['glossary','用語集','Glossary'],['about','このサイトについて','About'],['plan','社内メモ','Internal']],
 ribbon:['旅行ブロガー・サイト運営者向け','For travel bloggers and site owners'],
 heroH:['<em>旅の発信</em>を、<br>収益につなげる<br>はじめの一歩','Turn <em>your travel content</em><br>into income:<br>the first step'],
 heroP:['アフィリエイトの仕組みから、ジャンルの選び方、旅行ブログの収益化まで。日本の検索で使われている言葉で、順番にやさしく解説します。','From how affiliate marketing works to choosing a topic and monetising a travel blog, explained step by step in the words readers in Japan search with.'],
 bub:['はじめてでも大丈夫！','New here? No problem!'],
 cta:['無料で登録する','Sign up free'], read:['記事を読む','Read articles'], free:['登録無料','Free to join'],
 stats:[['11','ジャンル','の旅行カテゴリーで収益化（宿泊・航空券・ツアー・送迎など）','travel verticals: stays, flights, tours, transfers and more'],['24/7','','人によるサポート。返信までの平均時間は26分','human Support around the clock; average reply time 26 minutes'],['20','日','までに、複数のブランドの収益を、毎月まとめてお支払い','Earnings from several brands paid together by the 20th of each month']],
 statNote:['※ Travelpayouts のメッセージング・ガイドラインで承認されている数字です（日本向けの表現は公開前に確認）。','* Figures approved in the Travelpayouts messaging guideline (Japanese wording to be re-checked before launch).'],
 catH:['カテゴリーから探す','Browse by category'], catN:['記事','articles'],
 newH:['新着記事','Latest articles'], rankH:['おすすめ記事ランキング','Recommended articles'],
 rankN:['※ 編集部のおすすめ順です。','* In editors’ recommended order.'],
 tagH:['人気のテーマ','Popular topics'], profH:['編集部について','About the editors'],
 profP:['旅行ブロガーのために、日本の検索で使われている言葉でアフィリエイトの基本をまとめています。','We explain affiliate basics for travel bloggers in the words people in Japan actually search with.'],
 profName:['ラボ編集部（マスコット：タビィ）','The Lab editors (mascot: Tabi)'],
 sideCta:['旅行ブログを収益化しませんか？','Ready to monetise your travel blog?'],
 stepH:['はじめての方へ：3ステップ','New here? Three steps'],
 step:[['STEP 1','しくみを知る','アフィリエイトの流れと、3者の関係をつかみます。','Learn the flow and who is involved.','book'],['STEP 2','ジャンルを決める','好き・詳しい・需要の3つで、テーマを選びます。','Pick a topic by interest, expertise and demand.','compass'],['STEP 3','書いて、直す','体験記と比較記事から始め、数字を見て書き直します。','Start with trip reports and comparisons, then revise by numbers.','plane']],
 brandsH:['紹介できる旅行カテゴリー','Travel categories you can promote'],
 gloH:['用語をチェック','Check the terms'], gloAll:['用語集を見る','Open glossary'],
 ctaH:['旅行ブログの収益化を、はじめませんか？','Ready to monetise your travel content?'],
 ctaP:['Travelpayouts では、複数の旅行ブランドのプログラムをひとつのプラットフォームで利用できます。登録は無料です。','On Travelpayouts you can use programs from several travel brands on one platform. Registration is free.'],
 ctaFlag:['無料','FREE'],
 ctaSideH:['旅の発信を、収益につなげませんか？','Turn your travel content into income'], join:['Travelpayouts に参加する','Join Travelpayouts'],
 all:['すべての記事','All articles'], allT:['すべて','All'],
 sum:['この記事の要点','Key takeaway'], toc:['目次','Contents'], faq:['よくある質問','FAQ'], rel:['あわせて読みたい','Related articles'],
 srcT:['出典','Sources'], srcN:['出典の確認待ち。公開前に、一次情報を開いて内容を照合します。数字や条件の記載は、確認が済むまで仮のものです。','Sources pending. Before publishing, each claim is checked against a primary source. Figures and conditions are provisional until then.'],
 draft:['下書き','Draft'], upd:['更新日','Updated'], mins:['分で読めます','min read'], top:['ホーム','Home'],
 disclose:['Travelpayouts が運営しています。','Published by Travelpayouts.'],
 glH:['アフィリエイト用語集','Affiliate glossary'], glP:['日本のアフィリエイターが普段使う言葉と、Travelpayouts で使う言葉を、短く説明します。','Short explanations of terms Japanese affiliates use, and terms used at Travelpayouts.'],
 glS:['用語を検索','Search terms'], glK:[['すべて','All'],['一般用語','General'],['Travelpayouts用語','Travelpayouts']],
 pendT:['確認待ち','review pending'],
 aboutH:['このサイトについて','About this site'],
 planH:['記事計画・社内メモ','Content plan and internal notes'],
 planP:['このページは社内レビュー用で、公開サイトには出さない想定です。検索ボリュームはキーワード調査シート（Translation Queries）の数字です。','Internal review page, not meant for the public site. Volumes come from the keyword research sheet (Translation Queries).'],
 cols:[['優先','記事テーマ','日本語キーワード','月間検索','状態','備考'],['#','Article topic','Japanese keyword','Monthly searches','Status','Note']],
 tabs:[['all','新着','Latest'],['pop','人気','Popular'],['sale','セール・旅行','Sales & travel'],['data','データ・ルール','Data & rules']],
 promo:['本記事にはプロモーション（アフィリエイトリンク）が含まれます。','This article contains promotion (affiliate links).'],
 lvl:[['初級','Beginner'],['中級','Intermediate']], tell:['レベル','Level'],
 srcH:['出典と確認日','Sources and checked dates'],
 srcCk:['確認日','Checked'],
 srcNone:['この記事には、まだ出典の確認が済んでいない内容が含まれます。公開前に、一次情報で照合します。','This article still contains content whose sources have not been checked. It is verified against primary sources before publishing.'],
 srcNote:['公式サイトの情報は、各社の自己申告です。条件は変わることがあるため、最新の公式ページで確認してください。','Information from company sites is the company’s own statement. Terms change, so confirm on the current official page.'],
 logH:['更新履歴','Update log'], matH:['まとめ','Summary'],
 fb:['この記事は役に立ちましたか？','Was this article helpful?'], fbY:['はい','Yes'], fbN:['いいえ','No'], fbT:['ご意見ありがとうございます。','Thank you for your feedback.'],
 prev:['前の記事','Previous'], next:['次の記事','Next'], more:['次の記事も読むと、さらに詳しくなります','Keep reading'],
 saleH:['セール・キャンペーン情報','Sales and campaigns'], saleN:['※ TRAICYの2026年11月の記事より。期限が過ぎると変わります。','* From TRAICY, November 2026. Expired items change.'],
 catList:['カテゴリー','Categories'],
 calH:['イベント・セール・変更点カレンダー','Events, sales and changes calendar'], calP:['ブロガーが押さえておきたい、今後の予定です。出典のある項目だけを載せています。確認日：2026年11月9日。','Upcoming dates bloggers should know, listing only items with a source. Checked on 9 November 2026.'],
 corrH:['お詫びと訂正','Corrections'], corrP:['記事に誤りがあった場合は、ここに掲載します。現在、訂正はありません。','Corrections to articles are listed here. There are none at the moment.'],
 abSrcH:['参考にしている主な情報源','Main sources we rely on'],
 stbar:['旅行ブログの収益化は、無料の登録から。','Start monetising your travel blog with a free sign-up.']
};
var P=[
['1','アフィリエイトとは？仕組み','アフィリエイト とは / 仕組み','1,100 / 500','launch','記事あり（下書き）','Drafted'],
['2','アドアフィリエイトのやり方','アドアフィリエイト','2,700','launch','記事あり。媒体ポリシーの確認が必要','Drafted; media policies to verify'],
['3','アフィリエイトは稼げない？','アフィリエイト 稼げない','1,800','launch','記事あり。懐疑的な検索意図に合わせる','Drafted; matches sceptical intent'],
['4','ジャンルの選び方','アフィリエイト ジャンル','350','launch','記事あり。「ニッチ」ではなく「ジャンル」','Drafted; use ジャンル, not ニッチ'],
['5','旅行ブログの収益化','旅しながら稼ぐ / 旅行ブログ','70 / 60','launch','記事あり。自社に最も近いテーマ','Drafted; closest to our offer'],
['6','ASPとは・選び方','asp おすすめ','450','launch','記事あり。自社が「ASP」と見られる点を明記','Drafted; discloses our own position'],
['7','副業アフィリエイトは会社にばれる？','副業 アフィリエイト','1,400','queued','日本特有の関心。公的情報で裏付けが必要','Japan-specific concern; needs official sources'],
['8','アフィリエイトの収入の目安','アフィリエイト 収入 平均','40','queued','数字は出典の確認が必須','Figures need verified sources'],
['9','Instagramのアフィリエイト','インスタ アフィリエイト','1,100','queued','SNS向けの記事群の起点','Start of a social-media cluster'],
['10','初心者向けの始め方','アフィリエイト 初心者','1,100','queued','ヘッドタームとして強い','Strong head term'],
['11','クリック報酬型の案件','クリック報酬型 アフィリエイト','100','queued','「PPCアフィリエイト」は使わない（意味が異なる）','Avoid “PPCアフィリエイト” (different meaning)'],
['12','Pinterestのアフィリエイト','ピンタレスト アフィリエイト','50','held','日本では小さい媒体。需要が低い','Small platform in Japan; low demand'],
['13','ネイティブ広告のおすすめ','ネイティブ広告 アフィリエイト','–','held','検索需要がほぼ無い','Almost no search demand'],
['14','日払いのアフィリエイト','アフィリエイト 日払い','0','held','国内ASPは月払いが中心で需要が小さい','Monthly payouts dominate; negligible demand']
];
P=P.filter(function(p){return +p[0]<7||+p[0]>11}).concat(P3,P2);P.sort(function(x,y){return +x[0]-+y[0]});
var IC={
book:'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 19V5 M8 7h7',
megaphone:'M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z M15 9a4 4 0 0 1 0 6 M18 6.5a8 8 0 0 1 0 11',
chart:'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-8',
compass:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M15.5 8.5l-2 5-5 2 2-5z',
plane:'M10 14L21 3 M21 3l-6.5 18-3.5-8-8-3.5z',
link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
hotel:'M3 20V7 M3 14h18v6 M21 14v-2a3 3 0 0 0-3-3h-7v5 M7 11h.01',
ticket:'M3 8v3a2 2 0 0 1 0 4v3h18v-3a2 2 0 0 1 0-4V8z M14 8v10',
car:'M5 16h14 M4 16v-4l2-5h12l2 5v4 M7 19v-3 M17 19v-3 M7 12h.01 M17 12h.01',
shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
sim:'M7 3h7l4 4v14H7z M10 12h5v6h-5z',
check:'M5 12l5 5L20 7',
search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4',
info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01',
warn:'M12 3l10 18H2z M12 10v5 M12 18h.01',
star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
list:'M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01'
};
function ic(n,sw){return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||2)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n].split(' M').map(function(d,i){return '<path d="'+(i?'M':'')+d+'"/>'}).join('')+'</svg>'}
/* original mascot "Tabi" (traveller cloud with a paper-plane cap) */
function mascot(cls,face){
 var id='mc'+(Math.random()*1e6|0);
 return '<svg class="m '+(cls||'')+'" viewBox="0 0 120 120" role="img" aria-label="Tabi"><defs><clipPath id="'+id+'"><circle cx="60" cy="60" r="58"/></clipPath></defs><circle cx="60" cy="60" r="58" fill="#ffd54a"/><g clip-path="url(#'+id+')">'+
 /* body: blue travel jacket, backpack straps, camera */
 '<path d="M18 124Q22 88 60 84Q98 88 102 124Z" fill="#006dff"/><path d="M44 86L40 124M76 86L80 124" stroke="#d9480f" stroke-width="5" stroke-linecap="round"/>'+
 '<path d="M50 84L60 98L70 84" fill="none" stroke="#fff" stroke-width="3"/>'+
 '<path d="M44 86Q56 108 64 104M76 86Q64 108 56 104" fill="none" stroke="#14233a" stroke-width="2.4"/>'+
 '<rect x="46" y="98" width="28" height="17" rx="4" fill="#14233a"/><rect x="50" y="95" width="9" height="5" rx="1.5" fill="#14233a"/><circle cx="60" cy="106.5" r="6" fill="#cfd6e0"/><circle cx="60" cy="106.5" r="3.6" fill="#14233a"/><circle cx="58.6" cy="105.3" r="1.1" fill="#fff"/><circle cx="69" cy="101.5" r="1.6" fill="#ffd54a"/></g>'+
 /* head */
 '<rect x="52" y="76" width="16" height="10" rx="5" fill="#f5cba7"/><ellipse cx="60" cy="58" rx="25" ry="24" fill="#ffe0c2"/>'+
 '<path d="M35 56Q34 40 60 38Q86 40 85 56Q80 46 60 46Q40 46 35 56Z" fill="#5b3a29"/>'+
 /* bucket hat */
 '<ellipse cx="60" cy="40" rx="37" ry="9" fill="#c2410c"/><path d="M40 40Q40 17 60 17Q80 17 80 40Z" fill="#ea580c"/><rect x="40" y="33" width="40" height="6" fill="#14233a"/><circle cx="73" cy="36" r="2.4" fill="#ffd54a"/>'+
 /* face */
 '<circle cx="50" cy="60" r="3.6" fill="#14233a"/><circle cx="70" cy="60" r="3.6" fill="#14233a"/><circle cx="51.2" cy="58.8" r="1.2" fill="#fff"/><circle cx="71.2" cy="58.8" r="1.2" fill="#fff"/>'+
 '<circle cx="42" cy="68" r="4.4" fill="#ffa8b8" opacity=".8"/><circle cx="78" cy="68" r="4.4" fill="#ffa8b8" opacity=".8"/>'+
 (face==='o'?'<ellipse cx="60" cy="71" rx="3.6" ry="4.4" fill="#14233a"/>':'<path d="M52 68Q60 77 68 68" fill="none" stroke="#14233a" stroke-width="3" stroke-linecap="round"/>')+
 /* waving hand with paper plane */
 '<circle cx="97" cy="82" r="6.5" fill="#ffe0c2"/><path d="M104 68L118 62L110 76Z" fill="#fff" stroke="#14233a" stroke-width="1.6" stroke-linejoin="round"/></svg>'}
function f(s){return s.replace(/\*\*(.+?)\*\*/g,'<mark>$1</mark>')}
var CT={};CATS.forEach(function(c){CT[c.id]=c});
var SLUG={};A.forEach(function(a){SLUG[a.id]=a});
var catFilter='all',glFilter=0,glQ='';
function thumb(a,big,isNew){
 var c=CT[a.cat];
 return '<div class="thumb'+(big?' big':'')+'" style="--c:'+c.c+'">'+
 '<svg class="bgd" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><circle cx="40" cy="170" r="70" fill="#fff" opacity=".08"/><circle cx="290" cy="20" r="60" fill="#fff" opacity=".1"/><circle cx="170" cy="30" r="6" fill="#ffd54a"/><circle cx="130" cy="150" r="4" fill="#fff" opacity=".5"/><circle cx="210" cy="160" r="8" fill="#ffd54a" opacity=".8"/><path d="M0 150Q60 120 120 150T240 150T360 140V180H0Z" fill="#fff" opacity=".1"/></svg>'+
 '<span class="lab">'+X(c.t)+'</span>'+(isNew?'<span class="nwb">NEW</span>':'')+
 '<span class="tx">'+X(a.eye)+'</span><span class="rc">'+ic(a.icon,1.8)+'</span></div>'}
var NEWORD=['sales-calendar','travel-demand','ai-seo','start-guide','income-guide','instagram','click-reward','earn-or-not','what-is-affiliate','travel-blog-income','pick-niche','ad-affiliate'];
var POPORD=['what-is-affiliate','start-guide','earn-or-not','ad-affiliate','instagram','income-guide','travel-blog-income','pick-niche','click-reward','sales-calendar','ai-seo','travel-demand'];
function ordered(ids){return ids.map(function(id){return SLUG[id]}).filter(Boolean)}
var tab='all';
function card(a,i){return '<a class="acard" href="#a-'+a.id+'">'+thumb(a,false,NEWORD.indexOf(a.id)<4)+'<div class="bd"><div class="meta"><span class="chip">'+X(T.lvl[a.lvl||0])+'</span><span>'+a.read+X(T.mins)+'</span></div><h3>'+X(a.t)+'</h3><p>'+f(X(a.s)).replace(/<\/?mark>/g,'').slice(0,L==='ja'?62:120)+'…</p></div></a>'}
function ctaBand(){return '<div class="cta-band"><span class="flag">'+X(T.ctaFlag)+'</span>'+mascot('','o')+'<div><h2>'+X(T.ctaH)+'</h2><p>'+X(T.ctaP)+'</p></div><a class="btn" href="'+KEY+'" target="_blank" rel="noopener">'+X(T.cta)+'</a></div>'}
function ctaSide(){return '<div class="cta-side"><span class="flag">'+X(T.ctaFlag)+'</span>'+mascot('','o')+'<h3>'+X(T.ctaSideH)+'</h3><p>'+X(T.ctaP)+'</p><a class="btn" href="'+KEY+'" target="_blank" rel="noopener">'+X(T.join)+'</a></div>'}
function sideBox(showProf,showNums){
 return '<aside class="side">'+
 (showProf?'<div class="box"><h3>'+X(T.profH)+'</h3><div class="prof">'+mascot('')+'<b>'+X(T.profName)+'</b><p>'+X(T.profP)+'</p></div></div>':'')+
 (showProf?'':ctaSide())+'</aside>'}
function tabList(){
 if(tab==='pop')return ordered(POPORD).slice(0,6);
 if(tab==='sale')return A.filter(function(a){return a.id==='sales-calendar'||a.id==='travel-blog-income'||a.id==='travel-demand'});
 if(tab==='data')return A.filter(function(a){return a.cat==='rules'||a.cat==='market'||a.cat==='seo'||a.id==='earn-or-not'});
 return ordered(NEWORD).slice(0,6)}
function setTab(t){tab=t;render()}
function home(){
 var icoMap={basics:'book',traffic:'megaphone',strategy:'compass',travel:'plane',service:'link',rules:'shield',seo:'search',market:'chart'};
 var cats=CATS.map(function(c){var n=A.filter(function(a){return a.cat===c.id}).length;
  return '<button class="tile" style="--c:'+c.c+'" onclick="goCat(\''+c.id+'\')"><span class="circ">'+ic(icoMap[c.id],1.8)+'</span>'+X(c.t)+'<small>'+n+' '+X(T.catN)+'</small></button>'}).join('');
 var steps=T.step.map(function(s){return '<div class="stepcard"><span class="st">'+s[0]+'</span><div class="circ">'+ic(s[4],1.8)+'</div><b>'+X([s[1],s[1]==='しくみを知る'?'Learn the basics':s[1]==='ジャンルを決める'?'Pick a topic':'Write, then revise'])+'</b><p>'+X([s[2],s[3]])+'</p></div>'}).join('');
 IC.pin='M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';
 var cat5=[['ticket',['航空券','Flights']],['hotel',['ホテル','Hotels']],['pin',['ツアー','Tours']],['car',['送迎・レンタカー','Transfers & cars']],['shield',['旅行保険','Insurance']],['sim',['eSIM','eSIM']]].map(function(c){return '<span class="tagchip" style="font-size:14px;padding:6px 16px;cursor:default"><span style="margin-right:6px;display:inline-flex">'+ic(c[0],1.8)+'</span>'+X(c[1])+'</span>'});
 var terms=G.slice(0,8).map(function(g){return '<a class="tagchip" href="#glossary">'+(L==='ja'?g[0]:g[1])+'</a>'}).join('');
 var tabs='<div class="tabs" role="tablist">'+T.tabs.map(function(t){return '<button role="tab" aria-selected="'+(tab===t[0])+'" onclick="setTab(\''+t[0]+'\')">'+X([t[1],t[2]])+'</button>'}).join('')+'</div>';
 return '<section class="hero"><div class="wrap"><div class="stage"><div class="copy"><span class="ribbon">'+X(T.ribbon)+'</span><h1>'+X(T.heroH)+'</h1><p class="lead">'+X(T.heroP)+'</p><div class="cta"><a class="btn" href="'+KEY+'" target="_blank" rel="noopener">'+X(T.cta)+'</a><a class="btn ghost" href="#articles">'+X(T.read)+'</a><span class="free">'+X(T.free)+'</span></div></div>'+
 '<div class="art"><div class="bub">'+X(T.bub)+'</div>'+mascot('')+'</div></div><div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>'+
'</div></section>'+
 '<section class="blk dotbg"><div class="wrap"><div class="sech"><small>NEW ARTICLES</small><h2>'+X(T.newH)+'</h2></div><div class="cols"><div>'+tabs+'<div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">'+tabList().map(card).join('')+'</div><p style="text-align:center;margin-top:24px"><a class="btn blue sm" href="#articles">'+X(T.all)+'</a></p></div>'+sideBox()+'</div></div></section>'+
 '<section class="blk" style="padding-block:8px 36px"><div class="wrap"><div class="badges">'+T.stats.map(function(s){return '<div class="badge"><span class="n">'+s[0]+'<small>'+(L==='ja'?s[1]:'')+'</small></span><p>'+X([s[2],s[3]])+'</p></div>'}).join('')+'</div></div></section>'+
 '<section class="blk stripe"><div class="wrap"><div class="sech"><small>TRAVEL CATEGORIES</small><h2>'+X(T.brandsH)+'</h2></div><div class="chips" style="justify-content:center">'+cat5.join('')+'</div><div class="sech" style="margin:36px 0 18px"><h2 style="font-size:20px">'+X(T.gloH)+'</h2></div><div class="chips" style="justify-content:center">'+terms+'</div><p style="text-align:center;margin-top:18px"><a class="btn ghost sm" href="#glossary">'+X(T.gloAll)+'</a></p></div></section>'}
function articles(){
 var fl='<div class="filters"><button aria-pressed="'+(catFilter==='all')+'" onclick="setCat(\'all\')">'+X(T.allT)+'</button>'+CATS.map(function(c){return '<button aria-pressed="'+(catFilter===c.id)+'" onclick="setCat(\''+c.id+'\')">'+X(c.t)+'</button>'}).join('')+'</div>';
 var list=ordered(NEWORD).filter(function(a){return catFilter==='all'||a.cat===catFilter});
 return '<section class="blk"><div class="wrap"><div class="sech"><small>ARTICLES</small><h2>'+X(T.all)+'</h2></div>'+fl+'<div class="cols"><div class="cards">'+list.map(card).join('')+'</div>'+sideBox()+'</div></div></section>'}
function blk(b){
 if(b.p)return '<p>'+f(X(b.p))+'</p>';
 if(b.h3)return '<h3>'+f(X(b.h3))+'</h3>';
 if(b.img)return '<figure class="artimg"><img src="../content/'+b.img.src+'" alt="'+X(b.img.alt).replace(/"/g,'&quot;')+'" loading="lazy"><figcaption>'+f(X(b.img.caption))+'</figcaption></figure>';
 if(b.steps)return '<ol class="steps">'+b.steps.map(function(s,i){return '<li><span class="sn">STEP<b>'+(i+1)+'</b></span><span>'+f(X(s))+'</span></li>'}).join('')+'</ol>';
 if(b.list)return '<ul class="checks">'+b.list.map(function(s){return '<li><span class="ck">'+ic('check',3)+'</span><span>'+f(X(s))+'</span></li>'}).join('')+'</ul>';
 if(b.table){var t=b.table;return '<div class="tblwrap"><table><thead><tr>'+t.head.map(function(h){return '<th>'+X(h)+'</th>'}).join('')+'</tr></thead><tbody>'+t.rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+f(X(c))+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'}
 if(b.say)return '<div class="say"><div class="who">'+mascot('')+'Tabi</div><div class="bb">'+f(X(b.say))+'</div></div>';
 if(b.point)return '<div class="point"><span class="cap">'+ic('star',2.4)+X(b.point[0])+'</span><p>'+f(X(b.point[1]))+'</p></div>';
 if(b.warn)return '<div class="warnbox"><span class="cap">'+ic('warn',2.4)+X(b.warn[0])+'</span><p>'+f(X(b.warn[1]))+'</p></div>';
 if(b.diff)return '<div class="diff"><div class="old"><b>'+X(['更新前','Before'])+'</b><p>'+X(b.diff[0]).replace(/^[^：:]*[：:]\s*/,'')+'</p></div><div class="new"><b>'+X(['更新後','After'])+'</b><p>'+X(b.diff[1]).replace(/^[^：:]*[：:]\s*/,'')+'</p></div></div>';
 return ''}
var fbDone={};
function fbVote(id){fbDone[id]=1;render()}
function srcList(a){
 if(!a.src.length)return '<div class="src"><b>'+X(T.srcT)+'：</b>'+X(T.srcNone)+'</div>';
 return '<div class="srcbox"><h2 class="mini">'+X(T.srcH)+'</h2><ul>'+a.src.map(function(id){var s=SRC[id];return '<li><a href="'+s.u+'" target="_blank" rel="noopener">'+X(s.n)+'</a><span class="st3">'+X(STYPE[s.t])+'</span><span class="ck3">'+(s.d==='n/a'?'':(L==='ja'?'発行日 ':'Published ')+s.d+' · ')+X(T.srcCk)+' '+CHECKED+'</span></li>'}).join('')+'</ul><p class="note">'+X(T.srcNote)+'</p></div>'}
function logList(a){return '<div class="srcbox"><h2 class="mini">'+X(T.logH)+'</h2><table class="logt"><tbody>'+a.log.map(function(l){return '<tr><td>'+l[0]+'</td><td>'+X(l[1])+'</td></tr>'}).join('')+'</tbody></table></div>'}
var CTAIN={"what-is-affiliate": ["どこで発信する？媒体の選び方", "旅行ブログを媒体に選ぶなら、案件探しからリンクの設置、数字の確認までをひとつの場所で進められると、最初の一歩がぐっと楽になります。Travelpayouts は、旅行ブランドのプログラム、リンク、レポート、お支払いをひとつのアカウントで管理できる、旅行に特化したプラットフォームです。", "If you choose a travel blog as your channel, it helps to find programs, place links and check numbers in one place. Travelpayouts is a travel-focused platform where brand programs, links, reports and payouts live in a single account."], "ad-affiliate": ["記事型との違い", "記事型で旅行の情報を育てていくなら、広告費をかけずに、読まれた分だけ積み上げていく進め方もあります。旅行の記事に合うプログラムは、Travelpayouts に登録すると、ひとつの管理画面から探せます。", "If you would rather build travel content as articles, you can grow it without ad spend. Once you sign up for Travelpayouts, you can browse programs that suit travel articles from a single dashboard."], "earn-or-not": ["続けている人がしていること", "続けている人は、案件選びと数字の確認を一か所にまとめていることが多いようです。Travelpayouts なら、複数の旅行ブランドのレポートとお支払いを、ひとつのアカウントで確認できます。", "People who keep going often keep program choice and number-checking in one place. With Travelpayouts you can see reports and payouts for several travel brands in a single account."], "pick-niche": ["旅行ジャンルの強み", "旅行を選んだなら、宿泊、航空券、ツアー、送迎、eSIMなど、紹介できるものが幅広いのも強みです。Travelpayouts では、11の旅行ジャンルを、ひとつのアカウントから扱えます。", "If you pick travel, the range of things you can recommend is a strength: stays, flights, tours, transfers, eSIMs and more. Travelpayouts lets you work with 11 travel verticals from one account."], "travel-blog-income": ["紹介できる旅行商品", "紹介できる商品が決まったら、次はどこから申し込むかです。Travelpayouts は旅行だけに特化していて、宿泊・航空券・ツアーなどのプログラムを、ひとつのアカウントでまとめて扱えます。登録は3ステップ、5〜7分です。", "Once you know what to recommend, the next question is where to sign up. Travelpayouts focuses on travel only, so stays, flights, tours and more sit in one account. Registration takes three steps and about 5–7 minutes."], "ai-seo": ["リスト記事・比較記事は大丈夫？", "人が確認し、読者の役に立つ比較記事を書くには、比べる材料が欠かせません。旅行の比較記事なら、Travelpayouts に登録すると、さまざまな旅行ブランドのプログラムをひとつの場所で見られます。", "Useful, human-checked comparison articles need something to compare. For travel comparisons, Travelpayouts puts programs from many travel brands in one place."], "sales-calendar": ["セール記事の書き方と、期限が来たときの更新", "セールの記事を書いたら、読者が予約に進みやすい導線も大切です。Travelpayouts なら、旅行ブランドのプログラムとリンクを、ひとつのアカウントから用意できます。", "After you write a sale article, an easy path to booking matters too. With Travelpayouts you can prepare travel brand programs and links from a single account."], "travel-demand": ["記事で数字を使うときの注意", "旅行の需要が動いているときこそ、読者の疑問に答える記事が役に立ちます。旅行ブログの収益化を考えているなら、Travelpayouts に登録して、旅行ブランドのプログラムを確認してみてください。", "When travel demand is moving, articles that answer readers’ questions are most useful. If you are thinking about monetising a travel blog, sign up for Travelpayouts and look at the brand programs."], "income-guide": ["自分の収益を見積もる式", "訪問数、クリック率、成約率、報酬額。見積もりに使う数字は、レポートで確認できると続けやすくなります。Travelpayouts のレポートで、旅行ブランドごとの数字をまとめて見られます。", "Visits, click rate, conversion rate and reward: the numbers behind your estimate are easier to keep up with when reports are at hand. Travelpayouts reports show figures for your travel brands together."], "instagram": ["リンクをどこに置くか", "プロフィールのリンク先に旅行の記事やまとめページを用意したら、そこに置く旅行ブランドのリンクが必要になります。Travelpayouts に登録すると、宿泊・航空券・ツアーなどのリンクを、ひとつのアカウントから作れます。", "Once your profile link leads to a travel article or hub page, you need travel brand links to place there. After signing up for Travelpayouts you can create links for stays, flights, tours and more from one account."], "start-guide": ["6つのステップ", "ステップ3の「登録」は、旅行をテーマにするなら Travelpayouts がおすすめです。登録は3ステップ、5〜7分で、旅行に特化したプログラムをひとつのアカウントで扱えます。", "For step three, signing up, Travelpayouts is a good fit if your topic is travel. Registration takes three steps and about 5–7 minutes, and travel-focused programs live in one account."], "click-reward": ["どちらを選ぶか", "どちらの形式が合うかは、テーマと読者しだいです。旅行の記事で試してみたいなら、Travelpayouts に登録して、旅行ブランドのプログラムの条件を見比べてみてください。", "Which model fits depends on your topic and readers. If you want to try it with travel articles, sign up for Travelpayouts and compare the travel brand programs’ terms."]};
function inCta(a,s){var c=CTAIN[a.id];if(!c||c[0]!==s.h[0])return '';return '<aside class="inpost"><div class="m">'+mascot('')+'</div><div><p>'+X([c[1],c[2]])+'</p><a class="btn sm" href="'+KEY+'" target="_blank" rel="noopener">'+X(T.cta)+'</a></div></aside>'}
function post(a){
 var c=CT[a.cat];var rel=a.rel.map(function(id){return SLUG[id]}).filter(Boolean);
 var ix=NEWORD.indexOf(a.id),pv=SLUG[NEWORD[ix-1]],nx=SLUG[NEWORD[ix+1]];
 return '<section class="blk" style="padding-top:24px"><div class="wrap"><div class="cols"><article class="post"><div class="crumb"><a href="#home">'+X(T.top)+'</a> › <a href="#articles" onclick="catFilter=\''+a.cat+'\'">'+X(c.t)+'</a></div>'+
 '<div class="meta"><span class="chip" style="background:'+c.c+';color:#fff">'+X(c.t)+'</span><span class="chip lv">['+X(T.tell)+'：'+X(T.lvl[a.lvl||0])+']</span><span class="chip o">'+a.kw.split(' / ')[0]+'</span></div>'+
 '<h1 style="margin-top:10px">'+X(a.t)+'</h1>'+
 '<div class="pmeta"><span>'+ic('clock')+' '+X(T.upd)+' '+a.log[a.log.length-1][0].replace(/-/g,'.')+'</span><span>'+a.read+X(T.mins)+'</span><span>'+X(['執筆：ラボ編集部','By the Lab editors'])+'</span></div>'+
 thumb(a,true,false)+
 '<div class="answer"><span class="cap">'+X(T.sum)+'</span><p>'+f(X(a.s))+'</p></div>'+
 '<details class="toc" open><summary>'+ic('list')+X(T.toc)+'</summary><ol>'+a.secs.map(function(s,i){return '<li><a onclick="go(\'s'+i+'\')">'+X(s.h)+'</a></li>'}).join('')+'<li><a onclick="go(\'faq\')">'+X(T.faq)+'</a></li>'+(a.matome?'<li><a onclick="go(\'mat\')">'+X(T.matH)+'</a></li>':'')+'</ol></details>'+
 a.secs.map(function(s,i){return '<div class="sec"><h2 id="s'+i+'">'+X(s.h)+'</h2>'+s.b.map(blk).join('')+inCta(a,s)+'</div>'}).join('')+
 '<div class="sec faq" id="faq"><h2>'+X(T.faq)+'</h2>'+a.faq.map(function(q){return '<details><summary><span class="q">Q</span><span>'+X(q[0])+'</span></summary><div class="ans"><span class="a">A</span><span>'+f(X(q[1]))+'</span></div></details>'}).join('')+'</div>'+
 (a.matome?'<p class="sep" aria-hidden="true">◇ ◇ ◇</p><div class="sec" id="mat"><h2 class="plain">'+X(T.matH)+'</h2><ul class="matome">'+a.matome.map(function(m){return '<li>'+X(m)+'</li>'}).join('')+'</ul></div>':'')+
 '<div class="fb">'+(fbDone[a.id]?'<b>'+X(T.fbT)+'</b>':'<b>'+X(T.fb)+'</b><button onclick="fbVote(\''+a.id+'\')">'+X(T.fbY)+'</button><button onclick="fbVote(\''+a.id+'\')">'+X(T.fbN)+'</button>')+'</div>'+
 logList(a)+
 '<div class="pn">'+(pv?'<a href="#a-'+pv.id+'"><small>‹ '+X(T.prev)+'</small>'+X(pv.t)+'</a>':'<span></span>')+(nx?'<a class="r" href="#a-'+nx.id+'"><small>'+X(T.next)+' ›</small>'+X(nx.t)+'</a>':'<span></span>')+'</div>'+
 '<div class="sech" style="margin:40px 0 18px"><h2 style="font-size:20px">'+X(T.more)+'</h2></div><div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">'+rel.map(card).join('')+'</div>'+
 '</article>'+sideBox(true)+'</div></div></section>'}
function glossary(){
 var q=glQ.toLowerCase();
 var list=G.filter(function(g){return (glFilter===0||(glFilter===1&&g[4]==='gen')||(glFilter===2&&g[4]==='tp'))&&(!q||(g[0]+g[1]+g[2]+g[3]).toLowerCase().indexOf(q)>=0)});
 return '<section class="blk"><div class="wrap"><div class="sech"><small>GLOSSARY</small><h2>'+X(T.glH)+'</h2><p>'+X(T.glP)+'</p></div>'+
 '<label class="glsearch">'+ic('search')+'<input id="glq" type="search" placeholder="'+X(T.glS)+'" value="'+glQ.replace(/"/g,'&quot;')+'" aria-label="'+X(T.glS)+'"></label>'+
 '<div class="filters">'+T.glK.map(function(k,i){return '<button aria-pressed="'+(glFilter===i)+'" onclick="setGl('+i+')">'+X(k)+'</button>'}).join('')+'</div>'+
 '<dl class="gl">'+list.map(function(g){var tp=g[4]==='tp';return '<div class="it'+(tp?' tp':'')+'"><dt><span>'+(L==='ja'?g[0]:g[1]+' · '+g[0])+'</span><span class="kind'+(tp?' tp':'')+'">'+X(tp?['Travelpayouts','Travelpayouts']:['一般','General'])+'</span>'+(tp?'<span class="pend">'+X(T.pendT)+'</span>':'')+'</dt><dd>'+(L==='ja'?g[2]:g[3])+'</dd></div>'}).join('')+'</dl>'+
 (list.length?'':'<p class="note" style="text-align:center;margin-top:24px">—</p>')+'</div></section>'}
function about(){
 var nums=[['11',['ジャンル','genres'],['の旅行カテゴリーで収益化できます（宿泊・航空券・ツアー・送迎・eSIMなど）','of travel to monetise: stays, flights, tours, transfers, eSIMs and more']],['24/7',['サポート','Support'],['人によるサポートが24時間。返信までの平均時間は26分','Human Support around the clock; average reply time is 26 minutes']],['20',['日まで','th'],['に、複数のブランドの収益を毎月まとめてお支払い。最低支払額は10ドルから（支払い方法により異なります）','Earnings from different brands paid together each month by the 20th; minimum payout from $10, depending on the method']]];
 return '<section class="blk"><div class="wrap prose" style="max-width:860px"><div class="sech"><small>ABOUT</small><h2>'+X(T.aboutH)+'</h2></div>'+
 '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div style="width:120px">'+mascot('')+'</div><div style="flex:1;min-width:240px"><h2 style="margin-top:0">'+X(['運営について','Who runs this site'])+'</h2><p>'+X(['旅アフィリ・ラボは、Travelpayouts が運営する、旅行ブロガーとサイト運営者のための情報サイトです。日本の検索で使われている言葉に合わせて、アフィリエイトの基礎から旅行ブログの収益化までを、やさしく解説します。','Tabi Affili Lab is published by Travelpayouts for travel bloggers and site owners. It explains affiliate basics through to monetising a travel blog, using the terms people in Japan search with.'])+'</p></div></div>'+
 '<h2>'+X(['Travelpayouts とは','About Travelpayouts'])+'</h2>'+
 '<p>'+X(['世界の旅行ブランドのプログラム、アフィリエイトリンク、手動と自動の収益化ツール、レポート、お支払い、サポートを、ひとつの場所で使えます。いくつのブランドを扱っても、ツール、レポート、お支払いはひとつのアカウントで管理できます。','Brand programs, affiliate links, manual and automated monetisation tools, reports, payouts and Support all live in one place. However many brands you promote, you manage tools, reports and payouts from a single account.'])+'</p>'+
 '<div class="nums">'+nums.map(function(s){return '<div><span class="n">'+s[0]+'<small>'+X(s[1])+'</small></span><p>'+X(s[2])+'</p></div>'}).join('')+'</div>'+
 '<p>'+X(['旅行サイト向けには、収益化を自動化する「Drive」も無料で使えます。Drive は記事を書き換えるものではなく、読者が予約したくなる場所に、関連するオファーを追加します。使う機能は、パートナーが選べます。','For travel sites there is also Drive, which automates monetisation and is free to use. Drive does not write or rewrite articles; it adds relevant offers where readers are ready to book, and partners choose which functions to use.'])+'</p>'+
 '<div class="cta-band" style="margin:28px 0 8px"><span class="flag">'+X(T.ctaFlag)+'</span>'+mascot('','o')+'<div><h2>'+X(['旅の発信を、収益につなげませんか？','Ready to turn your travel content into income?'])+'</h2><p>'+X(['Travelpayouts は、旅行クリエイターのための旅行アフィリエイトプラットフォームです。登録は3ステップ、5〜7分。無料で始められます。','Travelpayouts is the travel affiliate platform for travel creators. Registration takes three steps and about 5–7 minutes, and it is free to start.'])+'</p><a class="btn" href="'+KEY+'" target="_blank" rel="noopener">'+X(T.join)+'</a></div></div>'+
 '</div></section>'}
function plan(){var hd=T.cols[L==='ja'?0:1];
 var tm=TM.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>'}).join('');
 var sr=Object.keys(SRC).map(function(k){var s=SRC[k];var used=A.filter(function(a){return a.src.indexOf(k)>=0}).map(function(a){return a.id}).join(', ');return '<tr><td><a href="'+s.u+'" target="_blank" rel="noopener">'+s.n[0]+'</a></td><td>'+STYPE[s.t][0]+'</td><td>'+s.d+'</td><td>'+used+'</td></tr>'}).join('');
 return '<section class="blk"><div class="wrap"><span class="internal">INTERNAL</span><div class="sech" style="text-align:left"><h2 style="text-align:left">'+X(T.planH)+'</h2><p>'+X(T.planP)+'</p></div>'+
 '<div class="tblwrap"><table style="min-width:720px"><thead><tr>'+hd.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+P.map(function(p){return '<tr><td class="num">'+p[0]+'</td><td>'+p[1]+'</td><td>'+p[2]+'</td><td class="num">'+p[3]+'</td><td><span class="st2 '+p[4]+'">'+p[4]+'</span></td><td>'+(L==='ja'?p[5]:p[6])+'</td></tr>'}).join('')+'</tbody></table></div>'+
 '<div class="sech" style="text-align:left;margin-top:40px"><h2 style="text-align:left;font-size:22px">Источники и правило приоритета</h2><p>Приоритет у списка источников Мариши (JAO, Yano, CAA, TravelVoice, TRAICY, блог Судзуки; A8 и Moshimo — как рыночные данные конкурентов). Если данные противоречат, берём эти источники. Другие источники — только если в списке нет ответа, и с пометкой в статье.</p></div>'+
 '<div class="tblwrap"><table style="min-width:720px"><thead><tr><th>Источник</th><th>Тип</th><th>Дата публикации</th><th>Где используется</th></tr></thead><tbody>'+sr+'</tbody></table></div>'+
 '<div class="sech" style="text-align:left;margin-top:40px"><h2 style="text-align:left;font-size:22px">Терминология: правила редполитики → японский вариант</h2><p>Внутренняя таблица. Японские слова — кандидаты, нужна проверка носителем.</p></div>'+
 '<div class="tblwrap"><table style="min-width:720px"><thead><tr><th>Правило (Confluence, ToV)</th><th>JP</th><th>Комментарий</th><th>Статус</th></tr></thead><tbody>'+tm+'</tbody></table></div></div></section>'}
function corrections(){return '<section class="blk"><div class="wrap prose"><div class="sech"><small>CORRECTIONS</small><h2>'+X(T.corrH)+'</h2></div><p>'+X(T.corrP)+'</p></div></section>'}
function render(){
 document.body.className=L==='en'?'en':'';document.documentElement.lang=L;
 document.getElementById('lsel').value=L;
 document.getElementById('by').textContent=X(T.by);document.getElementById('banner').textContent=PROTO?X(T.banner):'';if(!PROTO)document.getElementById('banner').parentNode.parentNode.style.display='none';
 document.getElementById('tkl').textContent=X(T.tkl);document.getElementById('tk').textContent=X(T.tk);document.getElementById('tk').href='#a-sales-calendar';
 document.getElementById('logo').innerHTML=mascot('').replace('class="m ','style="width:40px;height:40px" class="m ');
 var h=(location.hash||'#home').slice(1);var cur=h.indexOf('a-')===0?'articles':h;
 document.getElementById('nav').innerHTML=T.nav.filter(function(n){return PROTO||n[0]!=='plan'}).map(function(n){return '<a href="#'+n[0]+'"'+(cur===n[0]?' aria-current="page"':'')+'>'+(L==='ja'?n[1]:n[2])+'</a>'}).join('');
 document.getElementById('catbar').innerHTML='<div class="wrap">'+CATS.map(function(c){return '<a href="#articles" onclick="catFilter=\''+c.id+'\'" style="--c:'+c.c+'">'+X(c.t)+'</a>'}).join('')+'</div>';
 var html;
 if(h.indexOf('a-')===0&&SLUG[h.slice(2)])html=post(SLUG[h.slice(2)]);
 else if(h==='articles')html=articles();else if(h==='glossary')html=glossary();else if(h==='about')html=about();else if(h==='plan')html=plan();else if(h==='corrections')html=corrections();else html=home();
 document.getElementById('app').innerHTML=html;
 var gq=document.getElementById('glq');if(gq){gq.oninput=function(){var p=gq.selectionStart;glQ=gq.value;render();var n=document.getElementById('glq');n.focus();try{n.setSelectionRange(p,p)}catch(e){}}}
 document.getElementById('foot').innerHTML='<div class="fl"><a href="#home">'+X(T.nav[0].slice(1))+'</a><a href="#articles">'+X([T.nav[1][1],T.nav[1][2]])+'</a><a href="#glossary">'+X([T.nav[2][1],T.nav[2][2]])+'</a><a href="#about">'+X([T.nav[3][1],T.nav[3][2]])+'</a></div><div>© Travelpayouts, 2011–'+new Date().getFullYear()+'</div>';
 document.getElementById('stp').textContent=X(T.stbar);document.body.classList.toggle('nostick',h.indexOf('a-')===0);
 document.getElementById('stb').innerHTML='<a class="btn sm" href="'+KEY+'" target="_blank" rel="noopener">'+X(T.cta)+'</a><a class="btn sm blue" href="#articles">'+X(T.read)+'</a>';
 document.title='旅アフィリ・ラボ';
}
function go(id){var e=document.getElementById(id);if(e)e.scrollIntoView({behavior:'smooth',block:'start'})}
function setCat(c){catFilter=c;render()}
function goCat(c){catFilter=c;location.hash='#articles';render()}
function setGl(i){glFilter=i;render()}
function setL(l){L=l;try{localStorage.setItem('lang',l)}catch(e){}render()}
document.getElementById('lsel').onchange=function(){setL(this.value)};
window.addEventListener('hashchange',function(){render();window.scrollTo(0,0)});
render();
