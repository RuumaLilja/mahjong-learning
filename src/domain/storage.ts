import type { StageId } from './quiz';

export interface StageRecord {
  attempts: number;
  completed: number;
  bestFirstTry: number;
}

export interface SavedData {
  version: 1;
  settings: { furigana: boolean; helperNumbers: boolean; showTime: boolean };
  stages: Record<StageId, StageRecord>;
}

const key = 'mahjong-learning:v1';

export function freshData(): SavedData {
  return {
    version: 1,
    settings: { furigana: true, helperNumbers: false, showTime: false },
    stages: {
      1: { attempts: 0, completed: 0, bestFirstTry: 0 },
      2: { attempts: 0, completed: 0, bestFirstTry: 0 },
      3: { attempts: 0, completed: 0, bestFirstTry: 0 },
      4: { attempts: 0, completed: 0, bestFirstTry: 0 },
      5: { attempts: 0, completed: 0, bestFirstTry: 0 },
      6: { attempts: 0, completed: 0, bestFirstTry: 0 },
      7: { attempts: 0, completed: 0, bestFirstTry: 0 },
      8: { attempts: 0, completed: 0, bestFirstTry: 0 },
      9: { attempts: 0, completed: 0, bestFirstTry: 0 },
      10: { attempts: 0, completed: 0, bestFirstTry: 0 },
      12: { attempts: 0, completed: 0, bestFirstTry: 0 },
      11: { attempts: 0, completed: 0, bestFirstTry: 0 },
    },
  };
}

export function loadData(): SavedData {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<SavedData> | null;
    if (value?.version === 1 && value.settings && value.stages && [1, 2, 3, 4, 5].every(id => value.stages?.[id as StageId])) {
      return { ...value, stages: { ...freshData().stages, ...value.stages } } as SavedData;
    }
  } catch {
    // Invalid or unavailable storage starts a new local profile.
  }
  return freshData();
}

export function saveData(data: SavedData): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // The current session remains playable when storage is unavailable.
  }
}

export function clearRecords(data: SavedData): SavedData {
  return { ...freshData(), settings: data.settings };
}
