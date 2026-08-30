import {
  catalog,
  isLitInMode,
  objectById,
  type GameMode,
  type SolarObject,
} from "./catalog";

export type Rng = () => number;

export type RoundState = {
  mode: GameMode;
  targetId: string;
  prompt: string;
  score: number;
  streak: number;
  feedback: "correct" | "incorrect" | null;
};

function playable(mode: GameMode): SolarObject[] {
  return catalog.filter(
    (object) =>
      isLitInMode(object, mode) &&
      object.type !== "star" &&
      object.type !== "region",
  );
}

function promptFor(object: SolarObject): string {
  return `FIND: ${object.name.toUpperCase()}`;
}

function pickTarget(mode: GameMode, rng: Rng, excludeId?: string): SolarObject {
  const all = playable(mode);
  const pool = all.filter((object) => object.id !== excludeId);
  const list = pool.length > 0 ? pool : all;
  const index = Math.min(
    list.length - 1,
    Math.max(0, Math.floor(rng() * list.length)),
  );
  return list[index]!;
}

export function startRound(rng: Rng, mode: GameMode = "planets"): RoundState {
  const target = pickTarget(mode, rng);
  return {
    mode,
    targetId: target.id,
    prompt: promptFor(target),
    score: 0,
    streak: 0,
    feedback: null,
  };
}

export function applyClick(
  state: RoundState,
  objectId: string,
  rng: Rng,
): RoundState {
  const clicked = objectById(objectId);
  if (!clicked || !isLitInMode(clicked, state.mode)) {
    return state;
  }
  if (objectId !== state.targetId) {
    return { ...state, streak: 0, feedback: "incorrect" };
  }
  const next = pickTarget(state.mode, rng, state.targetId);
  return {
    ...state,
    targetId: next.id,
    prompt: promptFor(next),
    score: state.score + 100,
    streak: state.streak + 1,
    feedback: "correct",
  };
}
