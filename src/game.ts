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

export type QuizState = {
  mode: GameMode;
  hardMode: boolean;
  currentId: string | null;
  remainingIds: string[];
  foundIds: string[];
  placed: number;
  total: number;
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

function playable(mode: GameMode, hardMode: boolean): SolarObject[] {
  return playableInMode(mode, { hardMode });
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
  hardMode: boolean = false,
): QuizState {
  const ids = shuffle(
    playable(mode, hardMode).map((object) => object.id),
    rng,
  );
  const currentId = ids[0] ?? null;
  const remainingIds = ids.slice(1);
  return {
    mode,
    hardMode,
    currentId,
    remainingIds,
    foundIds: [],
    placed: 0,
    total: ids.length,
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
    !isLitInMode(clicked, state.mode, { hardMode: state.hardMode })
  ) {
    return state;
  }
  if (objectId !== state.currentId) {
    const tries = state.triesOnCurrent + 1;
    if (tries >= MAX_GUESSES_PER_BODY) {
      return {
        ...advanceFromBody(state, state.currentId, "red", now, "revealed"),
        mistakes: state.mistakes + 1,
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
  const tries = state.triesOnCurrent + 1;
  return advanceFromBody(
    state,
    objectId,
    markForTries(tries),
    now,
    "correct",
  );
}
