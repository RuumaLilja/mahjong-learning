export type Suit = 'man' | 'pin' | 'sou';
export type Honor = 'east' | 'south' | 'west' | 'north' | 'white' | 'green' | 'red';
export type TileId = `${Suit}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | Honor;

export interface Tile {
  id: TileId;
  label: string;
  reading: string;
  family: '萬子' | '筒子' | '索子' | '字牌';
  number?: number;
  file: string;
}

const numerals = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const numberReadings = ['イー', 'リャン', 'サン', 'スー', 'ウー', 'ロー', 'チー', 'パー', 'チュー'];
const families = [
  { id: 'man', label: '萬子', file: 'Man', reading: 'ワン' },
  { id: 'pin', label: '筒子', file: 'Pin', reading: 'ピン' },
  { id: 'sou', label: '索子', file: 'Sou', reading: 'ソー' },
] as const;

const numberedTiles: Tile[] = families.flatMap(({ id, label, file, reading }) =>
  numerals.map((numeral, index) => ({
    id: `${id}${index + 1}` as TileId,
    label: `${numeral}${label[0]}`,
    reading: `${numberReadings[index]}${reading}`,
    family: label,
    number: index + 1,
    file: `${file}${index + 1}.svg`,
  })),
);

const honors: Tile[] = [
  { id: 'east', label: '東', reading: 'トン', family: '字牌', file: 'Ton.svg' },
  { id: 'south', label: '南', reading: 'ナン', family: '字牌', file: 'Nan.svg' },
  { id: 'west', label: '西', reading: 'シャー', family: '字牌', file: 'Shaa.svg' },
  { id: 'north', label: '北', reading: 'ペー', family: '字牌', file: 'Pei.svg' },
  { id: 'white', label: '白', reading: 'ハク', family: '字牌', file: 'Haku.svg' },
  { id: 'green', label: '發', reading: 'ハツ', family: '字牌', file: 'Hatsu.svg' },
  { id: 'red', label: '中', reading: 'チュン', family: '字牌', file: 'Chun.svg' },
];

export const tiles: readonly Tile[] = [...numberedTiles, ...honors];
export const tileById = Object.fromEntries(tiles.map(tile => [tile.id, tile])) as Record<TileId, Tile>;

export function tileUrl(tile: Tile, color: 'Regular' | 'Black' = 'Regular'): string {
  return `/tiles/${color}/${tile.file}`;
}
