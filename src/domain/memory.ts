import { tiles, type TileId } from './tiles';

export type PairCount = 6 | 12 | 26;

export interface MemoryCard {
  key: string;
  tile: TileId;
  faceUp: boolean;
  matched: boolean;
}

export function createMemoryDeck(pairCount: PairCount, random: () => number = Math.random): MemoryCard[] {
  const pool = [...tiles];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const cards = pool.slice(0, pairCount).flatMap(tile => [
    { key: `${tile.id}-a`, tile: tile.id, faceUp: false, matched: false },
    { key: `${tile.id}-b`, tile: tile.id, faceUp: false, matched: false },
  ]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
