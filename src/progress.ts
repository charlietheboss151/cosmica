import { playableInMode, type GameMode } from "./catalog";

export const PROGRESS_KEY = "cosmica-progress-v1";
export const XP_PER_LEVEL = 40;

export const LEVEL_TITLES = [
  "Cadet",
  "Navigator",
  "Pilot",
  "Ranger",
  "Scout",
  "Voyager",
  "Space Explorer",
  "Commander",
  "Admiral",
  "Cosmic Master",
] as const;

export type ProgressState = {
  xp: number;
  found: Record<GameMode, string[]>;
  bestPercent: Record<GameMode, number | null>;
};

export type ProgressStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function emptyProgress(): ProgressState {
  return {
    xp: 0,
    found: { planets: [], moons: [], celestial: [], spacecraft: [] },
    bestPercent: { planets: null, moons: null, celestial: null, spacecraft: null },
  };
}

function defaultStore(): ProgressStore {
  if (typeof localStorage === "undefined") {
    return { getItem: () => null, setItem: () => undefined };
  }
  return localStorage;
}

function isMode(value: string): value is GameMode {
  return (
    value === "planets" ||
    value === "moons" ||
    value === "celestial" ||
    value === "spacecraft"
  );
}

export function parseProgress(raw: unknown): ProgressState {
  const empty = emptyProgress();
  if (!raw || typeof raw !== "object") {
    return empty;
  }
  const row = raw as Partial<ProgressState>;
  const xp = typeof row.xp === "number" && row.xp >= 0 ? Math.floor(row.xp) : 0;
  const found = { ...empty.found };
  const bestPercent = { ...empty.bestPercent };
  if (row.found && typeof row.found === "object") {
    for (const key of Object.keys(row.found)) {
      if (!isMode(key)) {
        continue;
      }
      const ids = row.found[key];
      if (Array.isArray(ids)) {
        found[key] = [...new Set(ids.filter((id) => typeof id === "string"))];
      }
    }
  }
  const savedBest =
    row.bestPercent && typeof row.bestPercent === "object"
      ? row.bestPercent
      : undefined;
  if (savedBest) {
    for (const key of Object.keys(savedBest)) {
      if (!isMode(key)) {
        continue;
      }
      const percent = savedBest[key];
      bestPercent[key] =
        typeof percent === "number" && percent >= 0 && percent <= 100
          ? percent
          : null;
    }
  }
  return { xp, found, bestPercent };
}

export function loadProgress(store: ProgressStore = defaultStore()): ProgressState {
  try {
    const raw = store.getItem(PROGRESS_KEY);
    if (!raw) {
      return emptyProgress();
    }
    return parseProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(
  progress: ProgressState,
  store: ProgressStore = defaultStore(),
): void {
  store.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function applyRound(
  progress: ProgressState,
  round: {
    mode: GameMode;
    foundIds: string[];
    percent: number;
    score: number;
    fullSet: boolean;
  },
): ProgressState {
  const found = {
    ...progress.found,
    [round.mode]: [
      ...new Set([...progress.found[round.mode], ...round.foundIds]),
    ],
  };
  const bestPercent = { ...progress.bestPercent };
  if (
    round.fullSet &&
    Number.isFinite(round.percent) &&
    round.percent >= 0 &&
    (bestPercent[round.mode] === null || round.percent > bestPercent[round.mode]!)
  ) {
    bestPercent[round.mode] = Math.min(100, round.percent);
  }
  return {
    xp: progress.xp + Math.max(0, round.score),
    found,
    bestPercent,
  };
}

export function rankFromXp(xp: number): {
  level: number;
  title: string;
  into: number;
  need: number;
  percent: number;
} {
  const safe = Math.max(0, Math.floor(xp));
  const level = 1 + Math.floor(safe / XP_PER_LEVEL);
  const into = safe % XP_PER_LEVEL;
  const title =
    LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? "Cadet";
  const percent = Math.round((into / XP_PER_LEVEL) * 100);
  return { level, title, into, need: XP_PER_LEVEL, percent };
}

export function modeTotal(mode: GameMode, hardMode = false): number {
  return playableInMode(mode, { hardMode }).length;
}

export function modeDenom(progress: ProgressState, mode: GameMode): number {
  const easy = modeTotal(mode, false);
  const hard = modeTotal(mode, true);
  return progress.found[mode].length > easy ? hard : easy;
}

export function formatBest(percent: number | null): string | null {
  if (percent === null || !Number.isFinite(percent)) {
    return null;
  }
  const clamped = Math.min(100, Math.max(0, percent));
  const rounded = Math.round(clamped * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}
