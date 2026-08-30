import {
  catalog,
  isLitInMode,
  objectById,
  type GameMode,
  type SolarObject,
} from "./catalog";

export type Rng = () => number;

export type QuizState = {
  mode: GameMode;
  currentId: string | null;
  remainingIds: string[];
  foundIds: string[];
  placed: number;
  total: number;
  mistakes: number;
  startedAt: number;
  finishedAt: number | null;
  lastResult: "correct" | "incorrect" | null;
  prompt: string;
};

function playable(mode: GameMode): SolarObject[] {
  return catalog.filter(
    (object) =>
      isLitInMode(object, mode) &&
      object.type !== "star" &&
      object.type !== "region",
  );
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
): QuizState {
  const ids = shuffle(
    playable(mode).map((object) => object.id),
    rng,
  );
  const currentId = ids[0] ?? null;
  const remainingIds = ids.slice(1);
  return {
    mode,
    currentId,
    remainingIds,
    foundIds: [],
    placed: 0,
    total: ids.length,
    mistakes: 0,
    startedAt: now,
    finishedAt: currentId ? null : now,
    lastResult: null,
    prompt: promptFor(currentId),
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
  if (!clicked || !isLitInMode(clicked, state.mode)) {
    return state;
  }
  if (objectId !== state.currentId) {
    return { ...state, mistakes: state.mistakes + 1, lastResult: "incorrect" };
  }
  const foundIds = [...state.foundIds, objectId];
  const [currentId, ...remainingIds] = state.remainingIds;
  const finished = !currentId;
  return {
    ...state,
    currentId: currentId ?? null,
    remainingIds,
    foundIds,
    placed: foundIds.length,
    finishedAt: finished ? now : null,
    lastResult: "correct",
    prompt: promptFor(currentId ?? null),
  };
}
