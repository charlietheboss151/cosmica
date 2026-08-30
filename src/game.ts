import { objectsForMode, type SolarObject } from "./catalog";

export type Rng = () => number;

export type RoundState = {
  targetId: string;
  prompt: string;
  score: number;
  streak: number;
  feedback: "correct" | "incorrect" | null;
};

function planets(): SolarObject[] {
  return objectsForMode("planets").filter((object) => object.type === "planet");
}

function promptFor(object: SolarObject): string {
  return `FIND: ${object.name.toUpperCase()}`;
}

function pickPlanet(rng: Rng, excludeId?: string): SolarObject {
  const all = planets();
  const pool = all.filter((object) => object.id !== excludeId);
  const list = pool.length > 0 ? pool : all;
  const index = Math.min(
    list.length - 1,
    Math.max(0, Math.floor(rng() * list.length)),
  );
  return list[index]!;
}

export function startRound(rng: Rng): RoundState {
  const target = pickPlanet(rng);
  return {
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
  if (objectId !== state.targetId) {
    return { ...state, streak: 0, feedback: "incorrect" };
  }
  const next = pickPlanet(rng, state.targetId);
  return {
    targetId: next.id,
    prompt: promptFor(next),
    score: state.score + 100,
    streak: state.streak + 1,
    feedback: "correct",
  };
}

