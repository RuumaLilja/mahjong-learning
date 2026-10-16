import { createDrillRun, type DrillQuestion } from './drills';
import questionBank from '../data/questions.json';
import { tileById, tiles, type Tile, type TileId } from './tiles';

export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type BaseQuestion = { id: string; explanation: string; hint?: string };
export type Question = DrillQuestion | BaseQuestion & (
  | { kind: 'family'; tile: TileId; choices: string[]; answer: string }
  | { kind: 'number'; tile: TileId; choices: string[]; answer: string }
  | { kind: 'reading'; tile: TileId; choices: string[]; answer: string }
  | { kind: 'tileFromReading'; prompt: string; choices: TileId[]; answer: TileId }
  | { kind: 'group'; prompt: string; choices: TileId[]; answer: TileId[] }
  | { kind: 'completeMeld'; prompt: string; pair: [TileId, TileId]; choices: TileId[]; answer: TileId[] }
);
type TileSpec = { id: string; kind: 'family' | 'number' | 'reading' | 'tileFromReading'; tile: TileId };
type GroupSpec = { id: string; kind: 'group'; prompt: string; choices: TileId[]; answer: TileId[]; explanation: string; hint?: string };
type CompleteMeldSpec = { id: string; kind: 'completeMeld'; pattern: 'twoWay' | 'edge' | 'gap' | 'triplet'; pair: [TileId, TileId] };
type QuestionSpec = TileSpec | GroupSpec | CompleteMeldSpec;

export const stages: readonly { id: StageId; title: string; summary: string }[] = [
  { id: 1, title: '牌の種類', summary: '萬子・筒子・索子' },
  { id: 2, title: '数字を見分ける', summary: '1から9までの数字' },
  { id: 4, title: '牌から読みを選ぶ', summary: '牌の絵を見てカナの読みを選ぶ' },
  { id: 7, title: '読みから牌を選ぶ', summary: 'カナの読みを見て牌の絵を選ぶ' },
  { id: 5, title: '牌の組み合わせ', summary: '雀頭・刻子・順子' },
  { id: 6, title: 'あと1枚で組を作る', summary: '2枚に足して刻子・順子を完成させる' },
  { id: 9, title: 'テンパイと待ち', summary: '13枚を見て、あと何が来れば完成するか' },
  { id: 10, title: 'テンパイにする何切る', summary: '14枚から1枚切って、あと1枚の形へ' },
  { id: 12, title: '一向聴の何切る', summary: '次にテンパイへ進む受け入れを比べる' },
];

export function completingTiles(pair: readonly [TileId, TileId]): TileId[] {
  const [first, second] = pair.map(id => tileById[id]);
  if (first.id === second.id) return [first.id];
  const firstNumber = first.number;
  const secondNumber = second.number;
  if (!firstNumber || !secondNumber || first.family !== second.family) return [];
  return tiles.filter(candidate => {
    if (candidate.family !== first.family || !candidate.number) return false;
    const numbers = [firstNumber, secondNumber, candidate.number].sort((a, b) => a - b);
    return numbers[0] + 1 === numbers[1] && numbers[1] + 1 === numbers[2];
  }).map(candidate => candidate.id);
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function materialize(spec: QuestionSpec, random: () => number): Question {
  if (spec.kind === 'group') return { ...spec, choices: shuffle(spec.choices, random) };
  if (spec.kind === 'completeMeld') {
    const answer = completingTiles(spec.pair);
    const [first, second] = spec.pair.map(id => tileById[id]);
    const distractors = shuffle(tiles.filter(tile => tile.family === first.family && !answer.includes(tile.id)), random)
      .sort((a, b) => first.number && second.number
        ? Math.abs((a.number ?? 0) - (first.number + second.number) / 2) - Math.abs((b.number ?? 0) - (first.number + second.number) / 2)
        : 0)
      .slice(0, 4 - answer.length).map(tile => tile.id);
    return {
      id: spec.id, kind: spec.kind, pair: spec.pair, prompt: 'この2枚に1枚足して刻子か順子を作るには？',
      choices: shuffle([...answer, ...distractors], random), answer,
      explanation: first.id === second.id
        ? `${first.label}をもう1枚足すと、同じ牌3枚の刻子になります。`
        : `${answer.map(id => tileById[id].label).join('または')}を1枚足すと、${first.family}で数字が連続する順子になります。`,
      hint: first.id === second.id ? '同じ牌3枚で刻子になります。' : '同じ種類で、数字が3つ連続する形を探します。',
    };
  }
  const tile = tileById[spec.tile];
  if (spec.kind === 'family') return {
    id: spec.id, kind: spec.kind, tile: tile.id,
    choices: shuffle(['萬子', '筒子', '索子', '字牌'], random), answer: tile.family,
    explanation: `${tile.label}は${tile.family}です。`,
  };
  if (spec.kind === 'number') return {
    id: spec.id, kind: spec.kind, tile: tile.id,
    choices: shuffle([String(tile.number), ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== tile.number), random).slice(0, 3).map(String)], random),
    answer: String(tile.number), explanation: `${tile.label}の数字は${tile.number}です。`,
  };
  const pool = tiles.filter(other => other.family === tile.family && other.id !== tile.id);
  if (spec.kind === 'reading') return {
    id: spec.id, kind: spec.kind, tile: tile.id,
    choices: shuffle([tile.reading, ...shuffle(pool, random).slice(0, 3).map(other => other.reading)], random),
    answer: tile.reading, explanation: `${tile.label}の読みは「${tile.reading}」です。`,
  };
  return {
    id: spec.id, kind: spec.kind, prompt: `「${tile.reading}」の牌を選ぶ`,
    choices: shuffle([tile.id, ...shuffle(pool, random).slice(0, 3).map(other => other.id)], random),
    answer: tile.id, explanation: `「${tile.reading}」は${tile.label}です。`,
  };
}

export function createRun(stage: StageId, random: () => number = Math.random): Question[] {
  if (stage >= 8) return createDrillRun(stage, random);
  const bank = questionBank[String(stage) as keyof typeof questionBank] as QuestionSpec[];
  if (stage === 6) {
    const meldBank = bank as CompleteMeldSpec[];
    const firstFour = (['twoWay', 'edge', 'gap', 'triplet'] as const)
      .map(pattern => shuffle(meldBank.filter(spec => spec.pattern === pattern), random)[0]);
    const extra = shuffle(meldBank.filter(spec => !firstFour.includes(spec)), random)[0];
    return shuffle([...firstFour, extra], random).map(spec => materialize(spec, random));
  }
  return shuffle(bank, random).slice(0, 5).map(spec => materialize(spec, random));
}

export function isCorrect(question: Question, selection: string[]): boolean {
  if (question.kind === 'drill') return selection.length === 1 && question.accepted.includes(selection[0]);
  if (question.kind !== 'group' && question.kind !== 'completeMeld') return selection.length === 1 && selection[0] === question.answer;
  return selection.length === question.answer.length &&
    [...new Set([...selection, ...question.answer])].every(id =>
      selection.filter(value => value === id).length === question.answer.filter(value => value === id).length,
    );
}

export function questionTile(question: Question): Tile | undefined {
  return 'tile' in question ? tileById[question.tile] : undefined;
}
