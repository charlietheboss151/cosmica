export type ObjectType = "star" | "planet";
export type GameMode = "planets";

export type SolarObject = {
  id: string;
  name: string;
  type: ObjectType;
  parentId: string | null;
  au: number;
  longitudeDeg: number;
  displaySize: number;
  color: string;
  modes: GameMode[];
  difficulty: number;
};

const PLANETS_MODE: GameMode[] = ["planets"];

export const catalog: SolarObject[] = [
  {
    id: "sun",
    name: "Sun",
    type: "star",
    parentId: null,
    au: 0,
    longitudeDeg: 0,
    displaySize: 22,
    color: "#ffd36a",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "mercury",
    name: "Mercury",
    type: "planet",
    parentId: "sun",
    au: 0.387,
    longitudeDeg: 248,
    displaySize: 6,
    color: "#c5c0b8",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "venus",
    name: "Venus",
    type: "planet",
    parentId: "sun",
    au: 0.723,
    longitudeDeg: 312,
    displaySize: 8,
    color: "#e8c27a",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "earth",
    name: "Earth",
    type: "planet",
    parentId: "sun",
    au: 1,
    longitudeDeg: 157,
    displaySize: 8.5,
    color: "#6ea8ff",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "mars",
    name: "Mars",
    type: "planet",
    parentId: "sun",
    au: 1.524,
    longitudeDeg: 84,
    displaySize: 7,
    color: "#e07a4d",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    parentId: "sun",
    au: 5.203,
    longitudeDeg: 71,
    displaySize: 16,
    color: "#d4a574",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "planet",
    parentId: "sun",
    au: 9.537,
    longitudeDeg: 341,
    displaySize: 14,
    color: "#ead29a",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "planet",
    parentId: "sun",
    au: 19.191,
    longitudeDeg: 54,
    displaySize: 11,
    color: "#7ec8d4",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "planet",
    parentId: "sun",
    au: 30.069,
    longitudeDeg: 358,
    displaySize: 11,
    color: "#4d7fff",
    modes: PLANETS_MODE,
    difficulty: 1,
  },
];

export function objectsForMode(mode: GameMode): SolarObject[] {
  return catalog.filter((object) => object.modes.includes(mode));
}

export function objectById(id: string): SolarObject | undefined {
  return catalog.find((object) => object.id === id);
}
