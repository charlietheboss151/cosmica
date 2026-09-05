import {
  isLitInMode,
  objectById,
  playableInMode,
  type GameMode,
  type SolarObject,
} from "./catalog";

export type Rng = () => number;

export type TryMark = "green" | "yellow" | "orange" | "red";

export const MAX_GUESSES_PER_BODY = 3;

export type QuizOptions = {
  hardMode?: boolean;
  parentIds?: string[];
};

export type QuizState = {
  mode: GameMode;
  hardMode: boolean;
  parentIds?: string[];
  currentId: string | null;
  remainingIds: string[];
  foundIds: string[];
  placed: number;
  total: number;
  /** Raw points: 3 / 2 / 1 for tries 1–3, same as Elementra. */
  score: number;
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  mistakes: number;
  triesOnCurrent: number;
  marks: Record<string, TryMark>;
  wrongFlashId: string | null;
  lastResolvedId: string | null;
  startedAt: number;
  finishedAt: number | null;
  lastResult: "correct" | "incorrect" | "revealed" | null;
  prompt: string;
};

function modeOptions(state: Pick<QuizState, "hardMode" | "parentIds">): {
  hardMode: boolean;
  parentIds?: string[];
} {
  return { hardMode: state.hardMode, parentIds: state.parentIds };
}

function playable(
  mode: GameMode,
  options: QuizOptions = {},
): SolarObject[] {
  return playableInMode(mode, {
    hardMode: options.hardMode ?? false,
    parentIds: options.parentIds,
  });
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    const a = next[i]!;
    next[i] = next[j]!;
    next[j] = a;
  }
  return next;
}

function promptFor(id: string | null): string {
  if (!id) {
    return "Round complete";
  }
  const object = objectById(id);
  return object ? `Click on ${object.name}` : "Round complete";
}

export function markForTries(tries: number): TryMark {
  if (tries <= 1) {
    return "green";
  }
  if (tries === 2) {
    return "yellow";
  }
  return "orange";
}

/** First try 3, second 2, third 1 — same as Elementra. */
export function pointsForTry(tryNumber: 1 | 2 | 3): number {
  return 4 - tryNumber;
}

export function scoreFromPoints(points: number): number {
  return Math.round((points / MAX_GUESSES_PER_BODY) * 10) / 10;
}

export function formatScore(points: number): string {
  const value = scoreFromPoints(points);
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function accuracyPercent(
  points: number,
  correct: number,
  incorrect: number,
): number {
  const answered = correct + incorrect;
  if (answered === 0) {
    return 0;
  }
  return Math.round((points / (answered * MAX_GUESSES_PER_BODY)) * 1000) / 10;
}

export function formatScoreLine(points: number, total: number): string {
  return `${formatScore(points)} / ${total}`;
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function startQuiz(
  mode: GameMode,
  rng: Rng,
  now: number = Date.now(),
  options: QuizOptions | boolean = {},
): QuizState {
  const resolved: QuizOptions =
    typeof options === "boolean" ? { hardMode: options } : options;
  const hardMode = resolved.hardMode ?? false;
  const parentIds = resolved.parentIds;
  const ids = shuffle(
    playable(mode, { hardMode, parentIds }).map((object) => object.id),
    rng,
  );
  const currentId = ids[0] ?? null;
  const remainingIds = ids.slice(1);
  return {
    mode,
    hardMode,
    parentIds,
    currentId,
    remainingIds,
    foundIds: [],
    placed: 0,
    total: ids.length,
    score: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: 0,
    triesOnCurrent: 0,
    marks: {},
    wrongFlashId: null,
    lastResolvedId: null,
    startedAt: now,
    finishedAt: currentId ? null : now,
    lastResult: null,
    prompt: promptFor(currentId),
  };
}

function advanceFromBody(
  state: QuizState,
  resolvedId: string,
  mark: TryMark,
  now: number,
  lastResult: QuizState["lastResult"],
): QuizState {
  const [currentId, ...remainingIds] = state.remainingIds;
  const finished = !currentId;
  const foundIds = [...state.foundIds, resolvedId];
  return {
    ...state,
    currentId: currentId ?? null,
    remainingIds,
    foundIds,
    placed: foundIds.length,
    triesOnCurrent: 0,
    wrongFlashId: null,
    lastResolvedId: resolvedId,
    marks: { ...state.marks, [resolvedId]: mark },
    finishedAt: finished ? now : null,
    lastResult,
    prompt: promptFor(currentId ?? null),
  };
}

export function applyClick(
  state: QuizState,
  objectId: string,
  now: number = Date.now(),
): QuizState {
  if (state.finishedAt !== null || !state.currentId) {
    return state;
  }
  const clicked = objectById(objectId);
  if (
    !clicked ||
    !isLitInMode(clicked, state.mode, modeOptions(state))
  ) {
    return state;
  }
  if (objectId !== state.currentId) {
    const tries = state.triesOnCurrent + 1;
    if (tries >= MAX_GUESSES_PER_BODY) {
      return {
        ...advanceFromBody(state, state.currentId, "red", now, "revealed"),
        mistakes: state.mistakes + 1,
        incorrect: state.incorrect + 1,
        streak: 0,
        wrongFlashId: objectId,
      };
    }
    return {
      ...state,
      mistakes: state.mistakes + 1,
      triesOnCurrent: tries,
      wrongFlashId: objectId,
      lastResult: "incorrect",
    };
  }
  const tries = (state.triesOnCurrent + 1) as 1 | 2 | 3;
  const nextStreak = state.streak + 1;
  return {
    ...advanceFromBody(
      state,
      objectId,
      markForTries(tries),
      now,
      "correct",
    ),
    score: state.score + pointsForTry(tries),
    correct: state.correct + 1,
    streak: nextStreak,
    bestStreak: Math.max(state.bestStreak, nextStreak),
  };
}
