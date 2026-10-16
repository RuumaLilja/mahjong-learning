import { tiles, type TileId } from './tiles';

export function counts(hand: readonly TileId[]): number[] {
  return tiles.map(tile => hand.filter(id => id === tile.id).length);
}

/** Normal hands only: four melds and one pair, with no fifth copy. */
export function winningGroups(hand: readonly TileId[]): TileId[][] | undefined {
  if (hand.length !== 14) return undefined;
  const c = counts(hand);
  if (c.some(n => n > 4)) return undefined;
  function melds(): TileId[][] | undefined {
    const i = c.findIndex(n => n > 0);
    if (i < 0) return [];
    if (c[i] >= 3) {
      c[i] -= 3;
      const ok = melds();
      c[i] += 3;
      if (ok) return [[tiles[i].id, tiles[i].id, tiles[i].id], ...ok];
    }
    if (i < 27 && i % 9 <= 6 && c[i + 1] && c[i + 2]) {
      c[i]--; c[i + 1]--; c[i + 2]--;
      const ok = melds();
      c[i]++; c[i + 1]++; c[i + 2]++;
      if (ok) return [[tiles[i].id, tiles[i + 1].id, tiles[i + 2].id], ...ok];
    }
    return undefined;
  }
  for (let i = 0; i < 34; i++) if (c[i] >= 2) {
    c[i] -= 2;
    const ok = melds();
    c[i] += 2;
    if (ok) return [...ok, [tiles[i].id, tiles[i].id]];
  }
  return undefined;
}

export function isWinning(hand: readonly TileId[]): boolean {
  return winningGroups(hand) !== undefined;
}

export function waits(hand: readonly TileId[]): TileId[] {
  return hand.length === 13 ? tiles.filter(tile => isWinning([...hand, tile.id])).map(tile => tile.id) : [];
}

export function discardOptions(hand: readonly TileId[]) {
  const known = counts(hand);
  return [...new Set(hand)].map(discard => {
    const remaining = [...hand];
    remaining.splice(remaining.indexOf(discard), 1);
    const winningTiles = waits(remaining);
    return { discard, waits: winningTiles, copies: winningTiles.reduce((n, id) => n + 4 - known[tiles.findIndex(t => t.id === id)], 0) };
  });
}

const shantenCache = new Map<string, number>();
/** Minimum distance for the normal four-meld-and-pair form. */
export function shanten(hand: readonly TileId[]): number {
  const c = counts(hand);
  const key = c.join('');
  const cached = shantenCache.get(key);
  if (cached !== undefined) return cached;
  let best = 8;
  function visit(start: number, meld: number, partial: number, pair: number): void {
    while (start < 34 && !c[start]) start++;
    if (start === 34) {
      best = Math.min(best, 8 - meld * 2 - Math.min(partial, 4 - meld) - pair);
      return;
    }
    const i = start;
    const take = (indices: number[], m: number, t: number, p: number) => {
      for (const index of indices) c[index]--;
      visit(i, m, t, p);
      for (const index of indices) c[index]++;
    };
    if (c[i] >= 3) take([i,i,i], meld + 1, partial, pair);
    if (i < 27 && i % 9 < 7 && c[i+1] && c[i+2]) take([i,i+1,i+2], meld + 1, partial, pair);
    if (c[i] >= 2) {
      if (!pair) take([i,i], meld, partial, 1);
      take([i,i], meld, partial + 1, pair);
    }
    if (i < 27 && i % 9 < 8 && c[i+1]) take([i,i+1], meld, partial + 1, pair);
    if (i < 27 && i % 9 < 7 && c[i+2]) take([i,i+2], meld, partial + 1, pair);
    take([i], meld, partial, pair);
  }
  visit(0,0,0,0);
  if (shantenCache.size > 60000) shantenCache.clear();
  shantenCache.set(key,best);
  return best;
}

export function efficiencyOptions(hand: readonly TileId[]) {
  const known = counts(hand);
  return [...new Set(hand)].map(discard => {
    const remaining = [...hand];
    remaining.splice(remaining.indexOf(discard),1);
    const distance = shanten(remaining);
    const effective = tiles.filter((tile,i) => known[i] < 4 && shanten([...remaining,tile.id]) < distance).map(tile => tile.id);
    return { discard, distance, effective, copies: effective.reduce((n,id) => n + 4 - known[tiles.findIndex(t => t.id === id)],0) };
  });
}
