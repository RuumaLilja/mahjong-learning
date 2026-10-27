import { tileById, tiles, type TileId } from './tiles';
import { discardOptions, waits, winningGroups, efficiencyOptions } from './hands';
import { shuffle } from './shuffle';

export type DrillQuestion = {
  id: string; kind: 'drill'; topic: number; pattern: number;
  prompt: string; note: string; hand: TileId[];
  choices: string[]; choiceTiles: TileId[][]; answer: string; accepted: string[];
  comparison?: { discard: TileId; copies: number; tiles: { id: TileId; copies: number }[] }[];
  explanation: string; hint: string; example?: { label: string; groups: TileId[][] };
};
const names = (ids: readonly TileId[]) => ids.map(id => tileById[id].label).join('・');
const sort = (ids: TileId[]) => ids.sort((a, b) => tiles.findIndex(t => t.id === a) - tiles.findIndex(t => t.id === b));
// Distinct shapes: two-sided, edge, closed, pair wait, double pair,
// and a connected 5-tile sequence shape. Suit rotation/reflection adds practice.
const templates = [
  'man2 man3 man4 pin6 pin6 pin6 sou7 sou8 sou9 east east man6 man7',
  'man5 man5 man5 pin2 pin3 pin4 sou6 sou7 sou8 white white man1 man2',
  'man7 man8 man9 pin2 pin2 pin2 sou3 sou4 sou5 red red man4 man6',
  'man2 man3 man4 pin5 pin5 pin5 sou1 sou2 sou3 east east east white',
  'man3 man3 man3 pin4 pin5 pin6 sou7 sou8 sou9 east east red red',
  'man2 man3 man4 man5 man6 pin7 pin7 pin7 sou6 sou7 sou8 green green',
  'man2 man2 man2 pin5 pin5 pin5 sou8 sou8 sou8 east east white white',
  'man3 man3 man3 man4 man5 pin2 pin3 pin4 sou6 sou6 sou6 red red',
  'man2 man3 man4 pin5 pin5 pin5 sou1 sou3 sou7 sou9 east east north',
  'man4 man4 man4 pin2 pin3 pin4 sou5 sou6 sou7 red red red east',
].map(text => text.split(' ') as TileId[]);

// Two completed melds, a pair, and competing incomplete shapes.
// These are authored independently of the waiting/tenpai-discard lessons.
const efficiencyTemplates = [
  'man2 man3 man4 pin6 pin6 pin6 east east man6 man7 pin1 pin2 sou4 sou6',
  'man3 man3 man3 pin5 pin6 pin7 red red man6 man8 pin2 pin3 sou7 sou8',
  'man1 man2 man3 sou5 sou5 sou5 white white man6 man7 pin4 pin6 sou8 sou9',
  'pin2 pin3 pin4 east east east sou6 sou6 man2 man3 pin7 pin9 sou1 sou2',
  'man7 man8 man9 pin4 pin4 pin4 red red man2 man4 pin6 pin7 sou3 sou4',
  'sou2 sou3 sou4 white white white pin8 pin8 man1 man2 pin3 pin5 sou6 sou7',
  'man3 man4 man5 pin8 pin8 pin8 sou2 sou2 sou2 man6 man7 pin3 sou5 sou7',
  'man1 man2 man3 pin5 pin5 pin5 sou7 sou8 sou9 east east man5 pin1 sou3',
].map(text => text.split(' ') as TileId[]);

function transform(id: TileId, rotation: number, mirror: boolean): TileId {
  const tile = tileById[id];
  if (!tile.number) return id;
  const suits = ['man', 'pin', 'sou'];
  return `${suits[(suits.indexOf(id.slice(0, 3)) + rotation) % 3]}${mirror ? 10 - tile.number : tile.number}` as TileId;
}

export function drillBank(topic: number): DrillQuestion[] {
  const result: DrillQuestion[] = [];
  const source = topic === 12 ? efficiencyTemplates : templates;
  for (let pattern = 0; pattern < source.length; pattern++) for (let variant = 0; variant < 6; variant++) {
    const tx = (id: TileId) => transform(id, variant % 3, variant >= 3);
    const hand = sort(source[pattern].map(tx));
    const base = { id: `drill-${topic}-${pattern}-${variant}`, kind: 'drill' as const, topic, pattern };
    if (topic === 9) {
      const winning = waits(hand);
      const key = (ids: TileId[]) => sort([...ids]).join(',');
      const nearby = winning.flatMap(id => {
        const tile = tileById[id];
        return tiles.filter(other => other.family === tile.family && other.number && tile.number && Math.abs(other.number - tile.number) === 1).map(other => [other.id]);
      });
      const repeated = [...new Set(hand)].filter(id => hand.filter(other => other === id).length >= 2).map(id => [id]);
      const alternatives = [winning, [], ...winning.map(id => [id]), ...nearby, ...repeated, ...[...new Set(hand)].map(id => [id])];
      const unique = [...new Map(alternatives.map(ids => [key(ids), ids])).values()].slice(0, 4);
      result.push({ ...base, hand, prompt: 'この手の待ちはどれ？', note: '13枚の手牌です。あと1枚で「4組＋雀頭」になる牌を選びます。七対子・国士無双は扱いません。',
        choices: unique.map(ids => ids.length ? names(ids) : 'まだテンパイしていない'), choiceTiles: unique,
        answer: winning.length ? names(winning) : 'まだテンパイしていない', accepted: [winning.length ? names(winning) : 'まだテンパイしていない'],
        explanation: winning.length ? `${names(winning)}のどれか1枚を加えると、4つの組と雀頭がそろいます。これが待ち牌です。` : 'どの牌を1枚加えても、4つの組と雀頭に分けられません。まだテンパイしていません。',
        example: winning.length ? { label: `${tileById[winning[0]].label}を加えたときの分け方`, groups: winningGroups([...hand, winning[0]])! } : undefined,
        hint: '完成した組と雀頭を見つけ、残った部分に何を足せばよいか考えましょう。' });
    } else if (topic === 10) {
      // Extra tiles include connected tiles and duplicates, not a repeated isolated honor.
      hand.push(tx((['man4','sou5','man3','sou4','pin8','man8','sou7','man2','sou8','pin5'] as TileId[])[pattern]));
      sort(hand);
      const options = discardOptions(hand);
      const accepted = options.filter(option => option.waits.length > 0).map(option => option.discard);
      if (!accepted.length) continue;
      result.push({ ...base, hand, prompt: 'どれを切るとテンパイする？',
        note: '14枚から1枚切ります。4組＋雀頭まであと1枚になる打牌を1つ選びます。待ちの広さは比べません。',
        choices: options.map(o => o.discard), choiceTiles: options.map(o => [o.discard]), answer: accepted[0], accepted,
        explanation: `正解の打牌：${names(accepted)}。\n` + options.filter(o => o.waits.length).map(o => `${tileById[o.discard].label}切り → 待ち：${names(o.waits)}`).join('\n') + '\nテンパイしても、実戦でリーチやロンができるかは鳴き・役・フリテンなどの条件によります。',
        hint: '刻子を崩す分け方も含めて、4組と雀頭にあと1枚で届く形を探します。' });
    } else if (topic === 12) {
      const options = efficiencyOptions(hand);
      const distance = Math.min(...options.map(o => o.distance));
      if (distance !== 1) throw new Error(`Expected one shanten: ${base.id}`);
      const best = Math.max(...options.filter(o => o.distance === distance).map(o => o.copies));
      const accepted = options.filter(o => o.distance === distance && o.copies === best).map(o => o.discard);
      result.push({ ...base, hand, prompt: 'テンパイへの受け入れが最も多い打牌は？',
        note: '一向聴（イーシャンテン）：有効な牌を引いて1枚切るとテンパイする段階です。一向聴を保ち、次にテンパイできる牌の残り枚数を比べます。4組＋雀頭のみ。見えているのはこの14枚だけで、役・打点・安全度は考えません。',
        choices: options.map(o => o.discard), choiceTiles: options.map(o => [o.discard]), answer: accepted[0], accepted,
        comparison: options.filter(o => o.distance === 1).sort((a,b) => b.copies - a.copies).map(o => ({ discard: o.discard, copies: o.copies, tiles: o.effective.map(id => ({ id, copies: 4 - hand.filter(known => known === id).length })) })),
        explanation: `正解の打牌：${names(accepted)}。どれを切っても受け入れは最多の${best}枚です。\n図の牌を次に引くと、1枚切ってテンパイにできます。牌の下の数字は残り枚数です。各4枚から手元の14枚（切った牌も含む）を引いて数えます。`,
        hint: '未完成の部分を比べます。両側で完成する形・間を埋める形・端の形では、テンパイへ進める牌の種類と枚数が違います。' });
    }
  }
  return result;
}

const banks = new Map<number, DrillQuestion[]>();
export function createDrillRun(topic: number, random: () => number): DrillQuestion[] {
  if (!banks.has(topic)) banks.set(topic, drillBank(topic));
  const bank = banks.get(topic)!;
  // Different structural patterns in every session, not five suit recolorings.
  return shuffle([...new Set(bank.map(q => q.pattern))], random).slice(0,5).map(pattern => {
    const question = shuffle(bank.filter(q => q.pattern === pattern), random)[0];
    const order = shuffle(question.choices.map((_, index) => index), random);
    return { ...question, choices: order.map(i => question.choices[i]), choiceTiles: order.map(i => question.choiceTiles[i]) };
  });
}
