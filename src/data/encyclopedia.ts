import type { TileId } from '../domain/tiles';

export type Entry = {
  id: string;
  name: string;
  reading: string;
  summary: string;
  detail?: string;
  groups?: TileId[][];
  caption?: string;
  media?: { src: string; alt: string }; // Local image or GIF can be added later.
  han?: string;
  closed?: boolean;
  condition?: string;
  category?: '基本' | '鳴き・アガリ' | '手牌の進み方' | '待ち' | '点数・局';
};

export const terms: Entry[] = [
  { id: 'menzen', name: '門前', reading: 'メンゼン', category: '基本', summary: '他の人の捨て牌をもらわず、手牌を自分でそろえている状態。', detail: 'チー・ポン・明カンをすると門前ではなくなります。自分の4枚でする暗カンなら門前のままです。リーチは門前でないと宣言できません。' },
  { id: 'mentsu', name: '面子', reading: 'メンツ', category: '基本', summary: '牌の組のこと。二萬・三萬・四萬のような順子や、七筒3枚のような刻子があります。', detail: '一般的なアガリ形では、この組を4つと同じ牌2枚の雀頭をそろえます。カンをした同じ牌4枚の組も面子です。', groups: [['man2','man3','man4'], ['pin7','pin7','pin7']], caption: '二萬・三萬・四萬の順子／七筒3枚の刻子' },
  { id: 'shuntsu', name: '順子', reading: 'シュンツ', category: '基本', summary: '同じ種類の数牌を、三索・四索・五索のように連続する3枚でそろえた組。', detail: '萬子・筒子・索子を混ぜたり、九から一へ数字をつなげたりはできません。', groups: [['sou3','sou4','sou5']], caption: '三索・四索・五索の順子' },
  { id: 'kotsu', name: '刻子', reading: 'コーツ', category: '基本', summary: '中・中・中のように、同じ牌を3枚そろえた組。', detail: '自分で3枚集めても、同じ牌2枚からポンしても作れます。', groups: [['red','red','red']], caption: '中を3枚そろえた刻子' },
  { id: 'toitsu', name: '対子・雀頭', reading: 'トイツ・ジャントウ', category: '基本', summary: '東・東のような同じ牌2枚が対子。4つの組を作る一般的なアガリ形では、残りの対子を雀頭と呼びます。', detail: '七対子は異なる対子を7組そろえる特別な形です。', groups: [['east','east']], caption: '東・東の対子' },
  { id: 'tatsu', name: '塔子', reading: 'ターツ', category: '基本', summary: 'あと1枚で順子になる数牌2枚。三筒・四筒なら二筒か五筒、三索・五索なら四索で完成します。', groups: [['pin3','pin4'], ['sou3','sou5']], caption: '三筒・四筒は二筒か五筒／三索・五索は四索を加える' },
  { id: 'naki', name: '鳴き', reading: 'ナキ', category: '鳴き・アガリ', summary: '他の人が捨てた牌をもらい、チー・ポン・明カンをすること。', detail: '鳴いた組は公開され、門前ではなくなります。リーチや門前限定の役は使えなくなります。', groups: [['man3','man4'], ['man5']], caption: '三萬・四萬に、他家の五萬を加えてチー' },
  { id: 'chi', name: 'チー', reading: 'チー', category: '鳴き・アガリ', summary: '左の人の捨て牌をもらって順子を作ること。', groups: [['sou4','sou5'], ['sou6']], caption: '四索・五索に左の人の六索を加える' },
  { id: 'pon', name: 'ポン', reading: 'ポン', category: '鳴き・アガリ', summary: '誰かの捨て牌をもらって刻子を作ること。', groups: [['white','white'], ['white']], caption: '白2枚に、捨てられた白を加える' },
  { id: 'kan', name: 'カン', reading: 'カン', category: '鳴き・アガリ', summary: '八筒を4枚そろえるように、同じ牌4枚をひと組として宣言すること。', detail: '自分の4枚で作る暗カン、他の人の捨て牌を使う明カン、ポンした組に1枚加える加カンがあります。宣言すると補充の牌を1枚引きます。', groups: [['pin8','pin8','pin8','pin8']], caption: '八筒4枚の槓子' },
  { id: 'agari', name: '和了', reading: 'アガリ', category: '鳴き・アガリ', summary: '待っていた牌で手を完成させ、役を満たしてその局の点数を得ること。', detail: '一般的な完成形は4つの面子と1つの雀頭です。七対子・国士無双は特別な形です。ドラを持っているだけでは役がないため、アガれません。' },
  { id: 'tsumo', name: 'ツモ', reading: 'ツモ', category: '鳴き・アガリ', summary: '待っていた牌を自分で引いてアガること。', detail: 'たとえば五萬を待っていて、自分の番に五萬を引いたらツモアガリです。' },
  { id: 'ron', name: 'ロン', reading: 'ロン', category: '鳴き・アガリ', summary: '待っていた牌を他の人が捨てたときにアガること。', detail: 'たとえば五萬を待っていて、他の人が五萬を捨てたらロンできます。ただしフリテン中はロンできません。' },
  { id: 'shanten', name: '向聴', reading: 'シャンテン', category: '手牌の進み方', summary: 'テンパイまでの距離を表す数。一向聴なら、あと1回手を進めるとテンパイです。', detail: '二向聴ならテンパイまであと2段階。テンパイは「0向聴」とも呼びます。' },
  { id: 'iishanten', name: '一向聴', reading: 'イーシャンテン', category: '手牌の進み方', summary: '有効な牌を引き、不要な牌を捨てればテンパイになる形。まだアガリ牌を待つ段階ではありません。', detail: '図では五索か八索を引いて中を捨てると、五萬または八萬を待つテンパイになります。', groups: [['man2','man3','man4'], ['pin3','pin4','pin5'], ['east','east'], ['sou6','sou7'], ['man6','man7'], ['red']], caption: '二・三・四萬／三・四・五筒／東の対子／六・七索／六・七萬／中' },
  { id: 'tenpai', name: '聴牌', reading: 'テンパイ', category: '手牌の進み方', summary: 'あと1枚でアガリ形が完成する状態。図では五萬か八萬を待っています。', detail: 'テンパイしていても、役がなければアガれません。門前ならリーチを宣言して役を付けられます。', groups: [['man2','man3','man4'], ['pin3','pin4','pin5'], ['sou6','sou7','sou8'], ['east','east'], ['man6','man7']], caption: '六萬・七萬に五萬か八萬を加えると完成' },
  { id: 'ukeire', name: '受け入れ', reading: 'ウケイレ', category: '手牌の進み方', summary: '引くと手が進む牌と、その残り枚数。たとえば三萬・四萬なら二萬か五萬が順子を完成させます。', detail: '各牌は通常4枚あります。自分の手牌に五萬が1枚あれば、見えていない五萬は最大3枚です。実際には他の人の捨て牌など、見えている牌も差し引きます。' },
  { id: 'machi', name: '待ち', reading: 'マチ', category: '待ち', summary: 'テンパイした手を完成させる牌。四萬・五萬なら三萬か六萬が待ちです。', detail: '複数の牌を待つこともあります。アガるには完成形だけでなく役も必要です。' },
  { id: 'ryanmen', name: '両面待ち', reading: 'リャンメンマチ', category: '待ち', summary: '2〜8の数牌で連続した2枚を持ち、その両端の牌を待つ形。1・2や8・9は辺張待ちです。', groups: [['man4','man5']], caption: '三萬か六萬を待つ' },
  { id: 'kanchan', name: '嵌張待ち', reading: 'カンチャンマチ', category: '待ち', summary: '1枚飛ばしの真ん中を待つ形。', groups: [['pin4','pin6']], caption: '五筒を待つ' },
  { id: 'penchan', name: '辺張待ち', reading: 'ペンチャンマチ', category: '待ち', summary: '1・2で3、または8・9で7を待つ形。', groups: [['sou1','sou2']], caption: '三索を待つ' },
  { id: 'shanpon', name: '双碰待ち', reading: 'シャンポンマチ', category: '待ち', summary: '対子が2組あり、どちらかを刻子にする待ち。', groups: [['east','east'], ['red','red']], caption: '東か中を待つ' },
  { id: 'tanki', name: '単騎待ち', reading: 'タンキマチ', category: '待ち', summary: '最後の1枚で対子を完成させる待ち。七対子でも使う呼び方。', detail: '通常の4面子1雀頭では雀頭を作る待ちです。七対子では7組目の対子を作る待ちも単騎待ちと呼びます。', groups: [['white']], caption: '白を待つ。七対子でも同じ待ち方になる' },
  { id: 'furiten', name: 'フリテン（振聴）', reading: 'フリテン', category: '鳴き・アガリ', summary: '待ち牌のどれかを自分で捨てていると、ほかの待ち牌でもロンできない状態。', detail: 'たとえば三萬・六萬待ちで、以前に三萬を捨てていたら、六萬でもロンできません。アガリ形になる牌を見逃した場合も、次の自分のツモまでロンできません。リーチ後に見逃すと、その局はロンできません。いずれもツモアガリは可能です。' },
  { id: 'riichi-term', name: 'リーチ', reading: 'リーチ', category: '鳴き・アガリ', summary: '門前でテンパイしたとき、千点棒を出して宣言すること。', detail: '宣言後は原則として手牌を入れ替えられません。アガれば「立直」の1翻が付き、裏ドラも確認できます。' },
  { id: 'yaku', name: '役', reading: 'ヤク', category: '点数・局', summary: 'アガるために必要な条件。たとえば門前でリーチする、白を3枚そろえるなど。', detail: '役ごとに翻数が決まります。ドラは翻数を増やすボーナスですが、ドラだけでは役にならずアガれません。' },
  { id: 'han', name: '翻', reading: 'ハン', category: '点数・局', summary: '役やドラの大きさを表す単位。リーチは1翻、ドラを1枚持てばさらに1翻です。', detail: '翻数が増えると、基本的にはアガったときの点数も上がります。点数は翻数だけでなく符などでも決まります。' },
  { id: 'dora', name: 'ドラ', reading: 'ドラ', category: '点数・局', summary: 'アガった手に入っていると1枚につき1翻増えるボーナス牌。ドラだけではアガれません。', detail: '表向きのドラ表示牌が四萬なら、次の五萬がドラです。九の次は一。風牌は東→南→西→北→東、三元牌は白→發→中→白の順です。' },
  { id: 'ura-dora', name: '裏ドラ', reading: 'ウラドラ', category: '点数・局', summary: 'リーチをかけてアガった人だけが使える、アガリ後に分かるドラ。', detail: '通常のドラ表示牌の下にある裏ドラ表示牌をめくり、その次の牌を裏ドラとして数えます。裏ドラ表示牌が四萬なら五萬が裏ドラ。手に五萬が2枚あれば2翻増えます。裏ドラも役にはなりません。' },
  { id: 'aka-dora', name: '赤ドラ', reading: 'アカドラ', category: '点数・局', summary: '赤い五萬・五筒・五索のこと。アガった手に1枚あれば1翻増えます。', detail: '通常のドラと同じく、赤ドラだけでは役がないためアガれません。' },
  { id: 'kan-dora', name: 'カンドラ', reading: 'カンドラ', category: '点数・局', summary: 'カンが成立すると増えるドラ。追加の表示牌の次の牌もドラになります。', detail: '元のドラはそのまま数え、増えたドラ表示牌の分を追加します。リーチしてアガった場合は、増えた表示牌に対応する裏ドラも確認できます。' },
  { id: 'bakaze', name: '場風・自風', reading: 'バカゼ・ジカゼ', category: '点数・局', summary: '場風は東場の「東」など局全体の方角、自風は自分の席の「東・南・西・北」。', detail: '自分に当てはまる風牌を3枚そろえると役牌になります。東場の東家なら東の刻子は場風と自風で計2翻です。', groups: [['east','east','east']], caption: '東場の東家で東を3枚そろえると2翻' },
  { id: 'ryuukyoku', name: '流局', reading: 'リュウキョク', category: '点数・局', summary: '山から引ける牌がなくなるなどして、誰もアガらず局が終わること。', detail: '通常の流局では、最後にテンパイしているかどうかで点数のやり取りが生じます。' },
];

export const yaku: Entry[] = [
  { id:'riichi', name:'立直', reading:'リーチ', han:'1翻', closed:true, summary:'鳴かずにテンパイし、千点棒を出してリーチを宣言してからアガる。', detail:'リーチ後は原則として手牌を入れ替えられません。アガると裏ドラも確認できます。' },
  { id:'ippatsu', name:'一発', reading:'イッパツ', han:'1翻', closed:true, summary:'リーチ後、次の自分のツモまでにロンまたはツモでアガる。', detail:'その間に誰かがチー・ポン・カンをすると一発は付きません。' },
  { id:'menzen-tsumo', name:'門前清自摸和', reading:'メンゼンツモ', han:'1翻', closed:true, summary:'チー・ポンなどで鳴かずに手を進め、自分でアガリ牌を引く。', detail:'門前で五萬を待ち、自分の番に五萬を引いてアガると成立します。' },
  { id:'tanyao', name:'断么九', reading:'タンヤオ', han:'1翻', summary:'1・9と字牌を使わず、2〜8の数牌だけでアガる。鳴いても成立する。', groups:[['man2','man3','man4'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['man6','man7','man8'],['pin5','pin5']], caption:'全て2〜8の数牌' },
  { id:'pinfu', name:'平和', reading:'ピンフ', han:'1翻', closed:true, summary:'4組をすべて順子にし、役牌でない雀頭を作り、両面待ちでアガる。', detail:'図は六萬・七萬で五萬か八萬を待ち、八萬で完成した例です。五筒の雀頭は役牌ではありません。', groups:[['man2','man3','man4'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['man6','man7','man8'],['pin5','pin5']], caption:'六萬・七萬の両面待ちを八萬で完成した例' },
  { id:'iipeikou', name:'一盃口', reading:'イーペーコー', han:'1翻', closed:true, summary:'二萬・三萬・四萬を2組、というように全く同じ順子を2組作る。', groups:[['man2','man3','man4'],['man2','man3','man4'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['east','east']], caption:'同じ二萬・三萬・四萬の順子が2組' },
  { id:'yakuhai', name:'役牌', reading:'ヤクハイ', han:'1翻（1組ごと）', summary:'白・發・中、または自分に当てはまる風牌を3枚そろえる。', detail:'図の中・中・中は、誰が持っていても役牌です。東は東場の全員、または東家にとって役牌になります。', groups:[['red','red','red'],['man1','man2','man3'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['east','east']], caption:'中を3枚そろえた例' },
  { id:'haitei', name:'海底摸月', reading:'ハイテイ', han:'1翻', summary:'山から引ける最後の1枚を自分で引き、その牌でツモアガリする。' },
  { id:'houtei', name:'河底撈魚', reading:'ホウテイ', han:'1翻', summary:'山の最後の牌を引いた人が捨てた牌でロンアガリする。' },
  { id:'rinshan', name:'嶺上開花', reading:'リンシャンカイホウ', han:'1翻', summary:'カンの後に補充として引く牌でツモアガリする。', detail:'たとえば八筒をカンし、補充で引いた牌が待っていた五萬なら成立します。' },
  { id:'chankan', name:'槍槓', reading:'チャンカン', han:'1翻', summary:'他の人がポンした組に4枚目を加えてカンするとき、その4枚目でロンする。' },
  { id:'daburi', name:'ダブル立直', reading:'ダブルリーチ', han:'2翻', closed:true, summary:'自分の最初の捨て牌で、誰も鳴いていないうちにリーチする。' },
  { id:'chiitoi', name:'七対子', reading:'チートイツ', han:'2翻', closed:true, summary:'二萬2枚・五萬2枚など、異なる牌の対子を7組そろえてアガる。', detail:'一般的な4面子1雀頭とは違う特別なアガリ形です。同じ牌4枚を対子2組として数えません。', groups:[['man2','man2'],['man5','man5'],['pin3','pin3'],['pin8','pin8'],['sou4','sou4'],['east','east'],['red','red']], caption:'異なる牌の対子が7組' },
  { id:'toitoi', name:'対々和', reading:'トイトイ', han:'2翻', summary:'順子を使わず、同じ牌3枚の刻子や4枚の槓子を4組そろえる。', detail:'図では二萬・四筒・七索・中がそれぞれ刻子です。鳴いて作った刻子も使えます。', groups:[['man2','man2','man2'],['pin4','pin4','pin4'],['sou7','sou7','sou7'],['red','red','red'],['east','east']], caption:'4組が全て刻子' },
  { id:'sanankou', name:'三暗刻', reading:'サンアンコー', han:'2翻', summary:'暗刻または暗槓を3組作る。', detail:'ロン牌で完成した刻子は暗刻になりません。3組目の暗刻をロンで完成させる形では成立しません。', groups:[['man2','man2','man2'],['pin4','pin4','pin4'],['sou7','sou7','sou7'],['man3','man4','man5'],['east','east']], caption:'最初の3組をツモでそろえた暗刻の例' },
  { id:'sanshoku-doujun', name:'三色同順', reading:'サンショクドウジュン', han:'2翻／鳴き1翻', summary:'三萬・四萬・五萬、三筒・四筒・五筒、三索・四索・五索をそろえるように、3種類で同じ数字の順子を作る。', groups:[['man3','man4','man5'],['pin3','pin4','pin5'],['sou3','sou4','sou5'],['man6','man7','man8'],['east','east']], caption:'3種類に三・四・五の順子' },
  { id:'ittsuu', name:'一気通貫', reading:'イッキツウカン', han:'2翻／鳴き1翻', summary:'同じ種類で123・456・789の順子を作る。', groups:[['man1','man2','man3'],['man4','man5','man6'],['man7','man8','man9'],['pin3','pin4','pin5'],['east','east']], caption:'萬子の1から9が順子3組に分かれる' },
  { id:'chanta', name:'混全帯么九', reading:'チャンタ', han:'2翻／鳴き1翻', summary:'全ての組と雀頭に1・9・字牌を含め、順子を少なくとも1組使う。', detail:'たとえば一萬・二萬・三萬の順子、中の刻子、東の雀頭はいずれも条件に合います。', groups:[['man1','man2','man3'],['pin7','pin8','pin9'],['sou1','sou2','sou3'],['red','red','red'],['east','east']], caption:'各組に1・9か字牌が入り、順子もある' },
  { id:'sankantsu', name:'三槓子', reading:'サンカンツ', han:'2翻', summary:'カンを3回して、同じ牌4枚の槓子を3組作る。', groups:[['man2','man2','man2','man2'],['pin4','pin4','pin4','pin4'],['sou7','sou7','sou7','sou7'],['man3','man4','man5'],['east','east']], caption:'二萬・四筒・七索をそれぞれカンした例' },
  { id:'sanshoku-doukou', name:'三色同刻', reading:'サンショクドーコー', han:'2翻', summary:'五萬3枚・五筒3枚・五索3枚のように、3種類で同じ数字の刻子を作る。', groups:[['man5','man5','man5'],['pin5','pin5','pin5'],['sou5','sou5','sou5'],['man1','man2','man3'],['east','east']], caption:'3種類に五の刻子' },
  { id:'shousangen', name:'小三元', reading:'ショウサンゲン', han:'2翻', summary:'白・發・中のうち2種類を3枚組にし、残り1種類を2枚の雀頭にする。', detail:'図は白を3枚、發を3枚、中を2枚。白と發の役牌もそれぞれ加わります。', groups:[['white','white','white'],['green','green','green'],['red','red'],['man1','man2','man3'],['pin3','pin4','pin5']], caption:'白と發は刻子、中は雀頭' },
  { id:'honroutou', name:'混老頭', reading:'ホンロウトー', han:'2翻', summary:'一萬・九筒・東のような1・9の数牌と字牌だけでアガる。', detail:'順子は作れないので、刻子と雀頭、または七対子の形になります。', groups:[['man1','man1','man1'],['pin9','pin9','pin9'],['sou1','sou1','sou1'],['east','east','east'],['red','red']], caption:'1・9の数牌と字牌だけの牌姿' },
  { id:'honitsu', name:'混一色', reading:'ホンイツ', han:'3翻／鳴き2翻', summary:'萬子だけ＋字牌のように、数牌を1種類だけにして字牌も使ってアガる。', groups:[['man1','man2','man3'],['man4','man5','man6'],['man7','man8','man9'],['red','red','red'],['east','east']], caption:'萬子と字牌だけの牌姿' },
  { id:'junchan', name:'純全帯么九', reading:'ジュンチャン', han:'3翻／鳴き2翻', summary:'一萬・二萬・三萬や七筒・八筒・九筒のように、全ての組と雀頭に1か9を含める。字牌は使わず、順子も必要。', groups:[['man1','man2','man3'],['pin7','pin8','pin9'],['sou1','sou2','sou3'],['sou7','sou8','sou9'],['man1','man1']], caption:'全ての組に1か9が入り、字牌はない' },
  { id:'ryanpeikou', name:'二盃口', reading:'リャンペーコー', han:'3翻', closed:true, summary:'一萬・二萬・三萬を2組、六筒・七筒・八筒を2組のように、同じ順子のペアを2つ作る。', groups:[['man1','man2','man3'],['man1','man2','man3'],['pin6','pin7','pin8'],['pin6','pin7','pin8'],['east','east']], caption:'一盃口になる組が2組' },
  { id:'chinitsu', name:'清一色', reading:'チンイツ', han:'6翻／鳴き5翻', summary:'萬子だけのように、1種類の数牌だけで手を完成させる。字牌も使わない。', groups:[['man1','man2','man3'],['man3','man4','man5'],['man6','man7','man8'],['man9','man9','man9'],['man5','man5']], caption:'萬子だけの牌姿' },
  { id:'nagashi', name:'流し満貫', reading:'ナガシマンガン', han:'満貫', summary:'流局まで自分の捨て牌が全て1・9・字牌で、他家に鳴かれていない。', detail:'アガリ形をそろえる役ではなく、流局時に成立する特別な扱いです。', condition:'流局時の特別な条件', groups:[['man1','pin9','east','sou1','red','man9','white']], caption:'捨て牌の例。流局まで1・9・字牌だけを捨て、どれも鳴かれない' },
  { id:'kokushi', name:'国士無双', reading:'コクシムソウ', han:'役満', closed:true, summary:'1・9の数牌と7種の字牌を全種類使い、そのうち1種類を2枚にする。', groups:[['man1','man9','pin1','pin9','sou1','sou9'],['east','south','west','north','white','green','red','red']], caption:'13種類を全て使い、中が2枚' },
  { id:'kokushi13', name:'国士無双十三面待ち', reading:'コクシムソウジュウサンメンマチ', han:'ダブル役満', closed:true, summary:'国士無双の13種類を1枚ずつそろえ、どれを引いても完成する待ち。', groups:[['man1','man9','pin1','pin9','sou1','sou9'],['east','south','west','north','white','green','red']], caption:'テンパイ形。13種類のどれでもアガれる' },
  { id:'suuankou', name:'四暗刻', reading:'スーアンコー', han:'役満', closed:true, summary:'暗刻・暗槓を4組作る。単騎待ちはダブル役満。', detail:'双碰待ちでロンした牌が4組目の刻子になる場合、その刻子は暗刻にならず四暗刻は成立しません。4組の暗刻をツモでそろえるか、4組を先にそろえて単騎待ちでアガります。', groups:[['man2','man2','man2'],['pin4','pin4','pin4'],['sou7','sou7','sou7'],['red','red','red'],['east','east']], caption:'4組を暗刻としてそろえた完成形の例' },
  { id:'suuankou-tanki', name:'四暗刻単騎', reading:'スーアンコータンキ', han:'ダブル役満', closed:true, summary:'四暗刻で雀頭を作る1枚を待ってアガる。', groups:[['man2','man2','man2'],['pin4','pin4','pin4'],['sou7','sou7','sou7'],['red','red','red'],['east']], caption:'テンパイ形。東を待って雀頭を作る' },
  { id:'daisangen', name:'大三元', reading:'ダイサンゲン', han:'役満', summary:'白・發・中を全て刻子または槓子にする。', groups:[['white','white','white'],['green','green','green'],['red','red','red'],['man1','man2','man3'],['east','east']], caption:'白・發・中が全て刻子' },
  { id:'shousuushii', name:'小四喜', reading:'ショウスーシー', han:'役満', summary:'風牌3種を刻子、残り1種を雀頭にする。', groups:[['east','east','east'],['south','south','south'],['west','west','west'],['north','north'],['man1','man2','man3']], caption:'東・南・西が刻子、北が雀頭' },
  { id:'daisuushii', name:'大四喜', reading:'ダイスーシー', han:'ダブル役満', summary:'東・南・西・北を全て刻子または槓子にする。', groups:[['east','east','east'],['south','south','south'],['west','west','west'],['north','north','north'],['man5','man5']], caption:'東・南・西・北の4組が刻子' },
  { id:'tsuuiisou', name:'字一色', reading:'ツーイーソー', han:'役満', summary:'字牌だけでアガる。', groups:[['east','east','east'],['south','south','south'],['west','west','west'],['white','white','white'],['red','red']], caption:'全て字牌の牌姿' },
  { id:'chinroutou', name:'清老頭', reading:'チンロートー', han:'役満', summary:'1・9の数牌だけでアガる。', groups:[['man1','man1','man1'],['man9','man9','man9'],['pin1','pin1','pin1'],['pin9','pin9','pin9'],['sou1','sou1']], caption:'1・9の数牌だけの牌姿' },
  { id:'ryuuiisou', name:'緑一色', reading:'リューイーソー', han:'役満', summary:'二・三・四・六・八索と發だけでアガる。', groups:[['sou2','sou3','sou4'],['sou2','sou3','sou4'],['sou6','sou6','sou6'],['green','green','green'],['sou8','sou8']], caption:'緑の索子と發だけの牌姿' },
  { id:'chuuren', name:'九蓮宝燈', reading:'チューレンポートー', han:'役満', closed:true, summary:'同じ種類の数牌で1112345678999に、同種の牌を1枚加える。純正九蓮宝燈はダブル役満。', groups:[['man1','man1','man1'],['man2','man3','man4','man5','man6','man7','man8'],['man9','man9','man9'],['man5']], caption:'萬子の基本形に五萬を1枚加えた例' },
  { id:'junsei-chuuren', name:'純正九蓮宝燈', reading:'ジュンセイチューレンポートー', han:'ダブル役満', closed:true, summary:'1112345678999の13枚で、同種の1〜9のどれでもアガれる待ち。', groups:[['man1','man1','man1'],['man2','man3','man4','man5','man6','man7','man8'],['man9','man9','man9']], caption:'テンパイ形。萬子の1〜9全てを待つ' },
  { id:'suukantsu', name:'四槓子', reading:'スーカンツ', han:'役満', summary:'カンを4回して、同じ牌4枚の槓子を4組作る。', groups:[['man2','man2','man2','man2'],['pin4','pin4','pin4','pin4'],['sou7','sou7','sou7','sou7'],['red','red','red','red'],['east','east']], caption:'二萬・四筒・七索・中をそれぞれカンした例' },
  { id:'tenhou', name:'天和', reading:'テンホー', han:'役満', closed:true, summary:'親が配牌の時点でアガリ形になっている。' },
  { id:'chiihou', name:'地和', reading:'チーホー', han:'役満', closed:true, summary:'子が最初のツモで、鳴きが入る前にアガる。' },
];
