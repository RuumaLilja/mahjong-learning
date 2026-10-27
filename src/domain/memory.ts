import { tiles, type TileId } from './tiles';
import { shuffle } from './shuffle';

export type PairCount = 6 | 12 | 26;

export interface MemoryCard {
  key: string;
  tile: TileId;
  faceUp: boolean;
  matched: boolean;
}

export function createMemoryDeck(pairCount: PairCount, random: () => number = Math.random): MemoryCard[] {
  const pool = shuffle(tiles, random);
  const cards = pool.slice(0, pairCount).flatMap(tile => [
    { key: `${tile.id}-a`, tile: tile.id, faceUp: false, matched: false },
    { key: `${tile.id}-b`, tile: tile.id, faceUp: false, matched: false },
  ]);
  return shuffle(cards, random);
}
