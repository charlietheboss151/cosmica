import { playableInMode, type GameMode } from "./catalog";
import { formatElapsed } from "./game";

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
  bestMs: Record<GameMode, number | null>;
};

export type ProgressStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function emptyProgress(): ProgressState {
  return {
    xp: 0,
    found: { planets: [], moons: [], celestial: [] },
    bestMs: { planets: null, moons: null, celestial: null },
  };
}

function defaultStore(): ProgressStore {
  if (typeof localStorage === "undefined") {
    return { getItem: () => null, setItem: () => undefined };
  }
  return localStorage;
}

function isMode(value: string): value is GameMode {
  return value === "planets" || value === "moons" || value === "celestial";
}

export function parseProgress(raw: unknown): ProgressState {
  const empty = emptyProgress();
  if (!raw || typeof raw !== "object") {
    return empty;
  }
  const row = raw as Partial<ProgressState>;
  const xp = typeof row.xp === "number" && row.xp >= 0 ? Math.floor(row.xp) : 0;
  const found = { ...empty.found };
  const bestMs = { ...empty.bestMs };
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
  if (row.bestMs && typeof row.bestMs === "object") {
    for (const key of Object.keys(row.bestMs)) {
      if (!isMode(key)) {
        continue;
      }
      const ms = row.bestMs[key];
      bestMs[key] = typeof ms === "number" && ms >= 0 ? ms : null;
    }
  }
  return { xp, found, bestMs };
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
    elapsedMs: number;
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
  const bestMs = { ...progress.bestMs };
  if (
    round.fullSet &&
    round.elapsedMs >= 0 &&
    (bestMs[round.mode] === null || round.elapsedMs < bestMs[round.mode]!)
  ) {
    bestMs[round.mode] = round.elapsedMs;
  }
  return {
    xp: progress.xp + Math.max(0, round.score),
    found,
    bestMs,
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

export function formatBest(ms: number | null): string | null {
  if (ms === null) {
    return null;
  }
  if (ms < 60_000) {
    const tenths = Math.round(ms / 100) / 10;
    return `${tenths.toFixed(1)}s`;
  }
  return formatElapsed(ms);
}
