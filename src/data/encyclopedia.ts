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
  { id: 'menzen', name: '門前', reading: 'メンゼン', category: '基本', summary: 'チー・ポン・明カンをせずに手を進めている状態。', detail: '暗カンをしても門前のままです。リーチなど、門前でしか成立しない役があります。' },
  { id: 'mentsu', name: '面子', reading: 'メンツ', category: '基本', summary: '順子・刻子・槓子の組。順子と刻子は3枚、槓子は同じ牌4枚で作ります。', groups: [['man2','man3','man4'], ['pin7','pin7','pin7']], caption: '順子と刻子の例' },
  { id: 'shuntsu', name: '順子', reading: 'シュンツ', category: '基本', summary: '同じ種類で数字が連続する3枚の組。', groups: [['sou3','sou4','sou5']], caption: '三索・四索・五索' },
  { id: 'kotsu', name: '刻子', reading: 'コーツ', category: '基本', summary: '同じ牌を3枚そろえた組。', groups: [['red','red','red']], caption: '中を3枚' },
  { id: 'toitsu', name: '対子・雀頭', reading: 'トイツ・ジャントウ', category: '基本', summary: '同じ牌2枚の組を対子と呼びます。通常の4面子1雀頭のアガリ形で頭になる対子が雀頭です。', detail: '七対子は7組の対子、国士無双は13種類の么九牌とそのうち1種類の対子で完成します。', groups: [['east','east']], caption: '東の対子' },
  { id: 'tatsu', name: '塔子', reading: 'ターツ', category: '基本', summary: 'あと1枚で順子になる、数牌2枚の形。', groups: [['pin3','pin4'], ['sou3','sou5']], caption: '連続する2枚／1枚飛ばしの2枚' },
  { id: 'naki', name: '鳴き', reading: 'ナキ', category: '鳴き・アガリ', summary: '他の人が捨てた牌をもらい、チー・ポン・明カンをすること。', detail: '鳴いた組は公開され、門前ではなくなります。リーチや門前限定の役は使えなくなります。', groups: [['man3','man4'], ['man5']], caption: '三萬・四萬に、他家の五萬を加えてチー' },
  { id: 'chi', name: 'チー', reading: 'チー', category: '鳴き・アガリ', summary: '左の人の捨て牌をもらって順子を作ること。', groups: [['sou4','sou5'], ['sou6']], caption: '四索・五索に左の人の六索を加える' },
  { id: 'pon', name: 'ポン', reading: 'ポン', category: '鳴き・アガリ', summary: '誰かの捨て牌をもらって刻子を作ること。', groups: [['white','white'], ['white']], caption: '白2枚に、捨てられた白を加える' },
  { id: 'kan', name: 'カン', reading: 'カン', category: '鳴き・アガリ', summary: '同じ牌4枚をひと組にすること。', detail: '自分の4枚で作る暗カン、捨て牌をもらう明カン、ポンした組に1枚加える加カンがあります。', groups: [['pin8','pin8','pin8','pin8']], caption: '八筒4枚の槓子' },
  { id: 'agari', name: '和了', reading: 'アガリ', category: '鳴き・アガリ', summary: '役を含む完成形をそろえて、局を終えること。', detail: '一般的な形は4面子1雀頭。七対子と国士無双は特別な形です。ドラだけでは役になりません。' },
  { id: 'tsumo', name: 'ツモ', reading: 'ツモ', category: '鳴き・アガリ', summary: '自分で引いた牌でアガること。' },
  { id: 'ron', name: 'ロン', reading: 'ロン', category: '鳴き・アガリ', summary: '他の人が捨てた牌でアガること。' },
  { id: 'shanten', name: '向聴', reading: 'シャンテン', category: '手牌の進み方', summary: 'テンパイまで、あと何段階かを表す数。', detail: '一向聴はテンパイまであと1段階。二向聴はあと2段階です。牌を引いてから捨てるまでの1手で進むことがあります。' },
  { id: 'iishanten', name: '一向聴', reading: 'イーシャンテン', category: '手牌の進み方', summary: 'あと1手でテンパイになる形。', detail: '次に有効な牌を引き、不要な牌を1枚捨てるとテンパイに進めます。この段階ではまだアガれません。', groups: [['man2','man3','man4'], ['pin3','pin4','pin5'], ['east','east'], ['sou6','sou7'], ['man6','man7'], ['red']], caption: '一向聴の例。五索か八索を引き、中を切るとテンパイ' },
  { id: 'tenpai', name: '聴牌', reading: 'テンパイ', category: '手牌の進み方', summary: 'あと1枚でアガリ形になる状態。', groups: [['man2','man3','man4'], ['pin3','pin4','pin5'], ['sou6','sou7','sou8'], ['east','east'], ['man6','man7']], caption: 'この例は五萬か八萬でアガリ形' },
  { id: 'ukeire', name: '受け入れ', reading: 'ウケイレ', category: '手牌の進み方', summary: '引くと手が進む牌と、その残り枚数。', detail: '同じ牌は通常4枚。自分の手牌や見えている牌を差し引いて考えます。' },
  { id: 'machi', name: '待ち', reading: 'マチ', category: '待ち', summary: 'テンパイしたとき、アガリに必要な牌。' },
  { id: 'ryanmen', name: '両面待ち', reading: 'リャンメンマチ', category: '待ち', summary: '2〜8の数牌で連続した2枚を持ち、その両端の牌を待つ形。1・2や8・9は辺張待ちです。', groups: [['man4','man5']], caption: '三萬か六萬を待つ' },
  { id: 'kanchan', name: '嵌張待ち', reading: 'カンチャンマチ', category: '待ち', summary: '1枚飛ばしの真ん中を待つ形。', groups: [['pin4','pin6']], caption: '五筒を待つ' },
  { id: 'penchan', name: '辺張待ち', reading: 'ペンチャンマチ', category: '待ち', summary: '1・2で3、または8・9で7を待つ形。', groups: [['sou1','sou2']], caption: '三索を待つ' },
  { id: 'shanpon', name: '双碰待ち', reading: 'シャンポンマチ', category: '待ち', summary: '対子が2組あり、どちらかを刻子にする待ち。', groups: [['east','east'], ['red','red']], caption: '東か中を待つ' },
  { id: 'tanki', name: '単騎待ち', reading: 'タンキマチ', category: '待ち', summary: '最後の1枚で対子を完成させる待ち。七対子でも使う呼び方。', detail: '通常の4面子1雀頭では雀頭を作る待ちです。七対子では7組目の対子を作る待ちも単騎待ちと呼びます。', groups: [['white']], caption: '白を待つ。七対子でも同じ待ち方になる' },
  { id: 'furiten', name: 'フリテン', reading: 'フリテン', category: '鳴き・アガリ', summary: '自分の捨て牌に待ち牌があるなど、ロンできない状態。', detail: 'フリテン中でも、自分で引いた牌によるツモアガリはできます。' },
  { id: 'riichi-term', name: 'リーチ', reading: 'リーチ', category: '鳴き・アガリ', summary: '門前でテンパイしたとき、千点棒を出して宣言すること。', detail: '宣言後は原則として手を変えられません。アガれば「立直」の役が付きます。' },
  { id: 'yaku', name: '役', reading: 'ヤク', category: '点数・局', summary: 'アガリを認めるために必要な条件。役ごとに翻数が決まります。', detail: 'ドラは翻数を増やしますが、ドラだけでアガることはできません。' },
  { id: 'han', name: '翻', reading: 'ハン', category: '点数・局', summary: '役やドラによる点数の倍率を表す単位。' },
  { id: 'dora', name: 'ドラ', reading: 'ドラ', category: '点数・局', summary: '持っていると翻数が増える牌。役そのものではありません。', detail: 'ドラ表示牌の次の牌がドラです。赤い五萬・五筒・五索も赤ドラとして扱います。' },
  { id: 'bakaze', name: '場風・自風', reading: 'バカゼ・ジカゼ', category: '点数・局', summary: '場の方角と、自分の席の方角。', detail: '該当する風牌を3枚そろえると役牌になります。場風と自風が同じ牌ならそれぞれ1翻です。', groups: [['east','east','east']], caption: '東場の東家なら東の刻子は2翻' },
  { id: 'ryuukyoku', name: '流局', reading: 'リュウキョク', category: '点数・局', summary: '誰もアガらずに局が終わること。' },
];

export const yaku: Entry[] = [
  { id:'riichi', name:'立直', reading:'リーチ', han:'1翻', closed:true, summary:'門前でテンパイし、千点棒を出して宣言してアガる。' },
  { id:'ippatsu', name:'一発', reading:'イッパツ', han:'1翻', closed:true, summary:'リーチ後、鳴きやカンを挟まずに次の自分のツモまでにアガる。' },
  { id:'menzen-tsumo', name:'門前清自摸和', reading:'メンゼンツモ', han:'1翻', closed:true, summary:'門前のまま自分で引いた牌でアガる。' },
  { id:'tanyao', name:'断么九', reading:'タンヤオ', han:'1翻', summary:'2〜8の数牌だけでアガる。鳴いても成立する。', groups:[['man2','man3','man4'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['man6','man7','man8'],['pin5','pin5']], caption:'全て2〜8の数牌' },
  { id:'pinfu', name:'平和', reading:'ピンフ', han:'1翻', closed:true, summary:'4組が順子、雀頭が役牌以外で、両面待ちでアガる。', groups:[['man2','man3','man4'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['man6','man7','man8'],['pin5','pin5']], caption:'萬子の6・7で5か8を待ち、8で完成した例' },
  { id:'iipeikou', name:'一盃口', reading:'イーペーコー', han:'1翻', closed:true, summary:'同じ種類・同じ数字の順子を2組作る。', groups:[['man2','man3','man4'],['man2','man3','man4'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['east','east']], caption:'同じ二萬・三萬・四萬の順子が2組' },
  { id:'yakuhai', name:'役牌', reading:'ヤクハイ', han:'1翻（1組ごと）', summary:'白・發・中、場風、自風のいずれかを刻子または槓子にする。', groups:[['red','red','red'],['man1','man2','man3'],['pin3','pin4','pin5'],['sou6','sou7','sou8'],['east','east']], caption:'中を3枚そろえた例' },
  { id:'haitei', name:'海底摸月', reading:'ハイテイ', han:'1翻', summary:'最後に引いた牌でツモアガリする。' },
  { id:'houtei', name:'河底撈魚', reading:'ホウテイ', han:'1翻', summary:'最後に捨てられた牌でロンアガリする。' },
  { id:'rinshan', name:'嶺上開花', reading:'リンシャンカイホウ', han:'1翻', summary:'カンの後に引く嶺上牌でツモアガリする。' },
  { id:'chankan', name:'槍槓', reading:'チャンカン', han:'1翻', summary:'他家がポンした組に牌を加えてカンするとき、その牌でロンアガリする。' },
  { id:'daburi', name:'ダブル立直', reading:'ダブルリーチ', han:'2翻', closed:true, summary:'最初の捨て牌で、鳴きが入る前にリーチする。' },
  { id:'chiitoi', name:'七対子', reading:'チートイツ', han:'2翻', closed:true, summary:'異なる対子を7組そろえる。', groups:[['man2','man2'],['man5','man5'],['pin3','pin3'],['pin8','pin8'],['sou4','sou4'],['east','east'],['red','red']], caption:'異なる牌の対子が7組' },
  { id:'toitoi', name:'対々和', reading:'トイトイ', han:'2翻', summary:'4面子をすべて刻子または槓子にする。', groups:[['man2','man2','man2'],['pin4','pin4','pin4'],['sou7','sou7','sou7'],['red','red','red'],['east','east']], caption:'4組が全て刻子' },
  { id:'sanankou', name:'三暗刻', reading:'サンアンコー', han:'2翻', summary:'暗刻または暗槓を3組作る。', detail:'ロン牌で完成した刻子は暗刻になりません。3組目の暗刻をロンで完成させる形では成立しません。', groups:[['man2','man2','man2'],['pin4','pin4','pin4'],['sou7','sou7','sou7'],['man3','man4','man5'],['east','east']], caption:'最初の3組をツモでそろえた暗刻の例' },
  { id:'sanshoku-doujun', name:'三色同順', reading:'サンショクドウジュン', han:'2翻／鳴き1翻', summary:'萬子・筒子・索子で同じ数字の順子を作る。', groups:[['man3','man4','man5'],['pin3','pin4','pin5'],['sou3','sou4','sou5'],['man6','man7','man8'],['east','east']], caption:'3種類に三・四・五の順子' },
  { id:'ittsuu', name:'一気通貫', reading:'イッキツウカン', han:'2翻／鳴き1翻', summary:'同じ種類で123・456・789の順子を作る。', groups:[['man1','man2','man3'],['man4','man5','man6'],['man7','man8','man9'],['pin3','pin4','pin5'],['east','east']], caption:'萬子の1から9が順子3組に分かれる' },
  { id:'chanta', name:'混全帯么九', reading:'チャンタ', han:'2翻／鳴き1翻', summary:'全ての組と雀頭に1・9・字牌のどれかを含め、順子も使う。', groups:[['man1','man2','man3'],['pin7','pin8','pin9'],['sou1','sou2','sou3'],['red','red','red'],['east','east']], caption:'各組に1・9か字牌が入り、順子もある' },
  { id:'sankantsu', name:'三槓子', reading:'サンカンツ', han:'2翻', summary:'槓子を3組作る。', groups:[['man2','man2','man2','man2'],['pin4','pin4','pin4','pin4'],['sou7','sou7','sou7','sou7'],['man3','man4','man5'],['east','east']], caption:'4枚の組を3組。カンした牌は各組4枚で表示' },
  { id:'sanshoku-doukou', name:'三色同刻', reading:'サンショクドーコー', han:'2翻', summary:'萬子・筒子・索子で同じ数字の刻子を作る。', groups:[['man5','man5','man5'],['pin5','pin5','pin5'],['sou5','sou5','sou5'],['man1','man2','man3'],['east','east']], caption:'3種類に五の刻子' },
  { id:'shousangen', name:'小三元', reading:'ショウサンゲン', han:'2翻', summary:'白・發・中のうち2組を刻子、残り1組を雀頭にする。', groups:[['white','white','white'],['green','green','green'],['red','red'],['man1','man2','man3'],['pin3','pin4','pin5']], caption:'白と發は刻子、中は雀頭' },
  { id:'honroutou', name:'混老頭', reading:'ホンロウトー', han:'2翻', summary:'1・9の数牌と字牌だけでアガる。七対子の形でも成立する。', groups:[['man1','man1','man1'],['pin9','pin9','pin9'],['sou1','sou1','sou1'],['east','east','east'],['red','red']], caption:'1・9の数牌と字牌だけの牌姿' },
  { id:'honitsu', name:'混一色', reading:'ホンイツ', han:'3翻／鳴き2翻', summary:'1種類の数牌と字牌だけでアガる。', groups:[['man1','man2','man3'],['man4','man5','man6'],['man7','man8','man9'],['red','red','red'],['east','east']], caption:'萬子と字牌だけの牌姿' },
  { id:'junchan', name:'純全帯么九', reading:'ジュンチャン', han:'3翻／鳴き2翻', summary:'全ての組と雀頭に1・9を含め、順子も使う。字牌は使わない。', groups:[['man1','man2','man3'],['pin7','pin8','pin9'],['sou1','sou2','sou3'],['sou7','sou8','sou9'],['man1','man1']], caption:'全ての組に1か9が入り、字牌はない' },
  { id:'ryanpeikou', name:'二盃口', reading:'リャンペーコー', han:'3翻', closed:true, summary:'同じ順子を2組作る形を、2組そろえる。', groups:[['man1','man2','man3'],['man1','man2','man3'],['pin6','pin7','pin8'],['pin6','pin7','pin8'],['east','east']], caption:'一盃口になる組が2組' },
  { id:'chinitsu', name:'清一色', reading:'チンイツ', han:'6翻／鳴き5翻', summary:'1種類の数牌だけでアガる。', groups:[['man1','man2','man3'],['man3','man4','man5'],['man6','man7','man8'],['man9','man9','man9'],['man5','man5']], caption:'萬子だけの牌姿' },
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
  { id:'suukantsu', name:'四槓子', reading:'スーカンツ', han:'役満', summary:'槓子を4組作る。', groups:[['man2','man2','man2','man2'],['pin4','pin4','pin4','pin4'],['sou7','sou7','sou7','sou7'],['red','red','red','red'],['east','east']], caption:'4枚の組を4組。カンした牌は各組4枚で表示' },
  { id:'tenhou', name:'天和', reading:'テンホー', han:'役満', closed:true, summary:'親が配牌の時点でアガリ形になっている。' },
  { id:'chiihou', name:'地和', reading:'チーホー', han:'役満', closed:true, summary:'子が最初のツモで、鳴きが入る前にアガる。' },
];
