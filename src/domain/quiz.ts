import questionBank from '../data/questions.json';
import { tileById, tiles, type Tile, type TileId } from './tiles';

export type StageId = 1 | 2 | 3 | 4 | 5;
type BaseQuestion = { id: string; explanation: string; hint?: string };
export type Question = BaseQuestion & (
  | { kind: 'family'; tile: TileId; choices: string[]; answer: string }
  | { kind: 'number'; tile: TileId; choices: string[]; answer: string }
  | { kind: 'reading'; tile: TileId; choices: string[]; answer: string }
  | { kind: 'tileFromReading'; prompt: string; choices: TileId[]; answer: TileId }
  | { kind: 'group'; prompt: string; choices: TileId[]; answer: TileId[] }
);
type TileSpec = { id: string; kind: 'family' | 'number' | 'reading' | 'tileFromReading'; tile: TileId };
type GroupSpec = { id: string; kind: 'group'; prompt: string; choices: TileId[]; answer: TileId[]; explanation: string; hint?: string };
type QuestionSpec = TileSpec | GroupSpec;

export const stages: readonly { id: StageId; title: string; summary: string }[] = [
  { id: 1, title: '牌の種類', summary: '萬子・筒子・索子' },
  { id: 2, title: '数字を見分ける', summary: '1から9までの数字' },
  { id: 3, title: '字牌の読み', summary: '牌とカナの読みを結びつける' },
  { id: 4, title: '牌と読みを結ぶ', summary: '絵から読み・読みから絵' },
  { id: 5, title: '牌の組み合わせ', summary: '雀頭・刻子・順子' },
];

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
  const bank = questionBank[String(stage) as keyof typeof questionBank] as QuestionSpec[];
  return shuffle(bank, random).slice(0, 5).map(spec => materialize(spec, random));
}

export function isCorrect(question: Question, selection: string[]): boolean {
  if (question.kind !== 'group') return selection.length === 1 && selection[0] === question.answer;
  return selection.length === question.answer.length &&
    [...new Set([...selection, ...question.answer])].every(id =>
      selection.filter(value => value === id).length === question.answer.filter(value => value === id).length,
    );
}

export function questionTile(question: Question): Tile | undefined {
  return 'tile' in question ? tileById[question.tile] : undefined;
}
