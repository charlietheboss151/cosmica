export type ObjectType = "star" | "planet" | "moon" | "dwarf-planet";
export type GameMode = "planets";

export type SolarObject = {
  id: string;
  name: string;
  type: ObjectType;
  parentId: string | null;
  au: number;
  localOrbit: number;
  longitudeDeg: number;
  displaySize: number;
  color: string;
  difficulty: number;
};

function body(
  partial: Omit<SolarObject, "localOrbit" | "difficulty"> & {
    localOrbit?: number;
    difficulty?: number;
  },
): SolarObject {
  return {
    localOrbit: 0,
    difficulty: 1,
    ...partial,
  };
}

export const catalog: SolarObject[] = [
  body({
    id: "sun",
    name: "Sun",
    type: "star",
    parentId: null,
    au: 0,
    longitudeDeg: 0,
    displaySize: 22,
    color: "#ffd36a",
  }),
  body({
    id: "mercury",
    name: "Mercury",
    type: "planet",
    parentId: "sun",
    au: 0.387,
    longitudeDeg: 248,
    displaySize: 6,
    color: "#c5c0b8",
  }),
  body({
    id: "venus",
    name: "Venus",
    type: "planet",
    parentId: "sun",
    au: 0.723,
    longitudeDeg: 312,
    displaySize: 8,
    color: "#e8c27a",
  }),
  body({
    id: "earth",
    name: "Earth",
    type: "planet",
    parentId: "sun",
    au: 1,
    longitudeDeg: 157,
    displaySize: 8.5,
    color: "#6ea8ff",
  }),
  body({
    id: "mars",
    name: "Mars",
    type: "planet",
    parentId: "sun",
    au: 1.524,
    longitudeDeg: 84,
    displaySize: 7,
    color: "#e07a4d",
  }),
  body({
    id: "ceres",
    name: "Ceres",
    type: "dwarf-planet",
    parentId: "sun",
    au: 2.77,
    longitudeDeg: 210,
    displaySize: 5,
    color: "#c4b8a8",
  }),
  body({
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    parentId: "sun",
    au: 5.203,
    longitudeDeg: 71,
    displaySize: 16,
    color: "#d4a574",
  }),
  body({
    id: "saturn",
    name: "Saturn",
    type: "planet",
    parentId: "sun",
    au: 9.537,
    longitudeDeg: 341,
    displaySize: 14,
    color: "#ead29a",
  }),
  body({
    id: "uranus",
    name: "Uranus",
    type: "planet",
    parentId: "sun",
    au: 19.191,
    longitudeDeg: 54,
    displaySize: 11,
    color: "#7ec8d4",
  }),
  body({
    id: "neptune",
    name: "Neptune",
    type: "planet",
    parentId: "sun",
    au: 30.069,
    longitudeDeg: 358,
    displaySize: 11,
    color: "#4d7fff",
  }),
  body({
    id: "pluto",
    name: "Pluto",
    type: "dwarf-planet",
    parentId: "sun",
    au: 39.48,
    longitudeDeg: 294,
    displaySize: 5,
    color: "#d6c4b0",
  }),
  body({
    id: "moon",
    name: "Moon",
    type: "moon",
    parentId: "earth",
    au: 0,
    localOrbit: 22,
    longitudeDeg: 40,
    displaySize: 4,
    color: "#d9d6d0",
  }),
  body({
    id: "io",
    name: "Io",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 22,
    longitudeDeg: 20,
    displaySize: 4,
    color: "#e8d36a",
  }),
  body({
    id: "europa",
    name: "Europa",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 32,
    longitudeDeg: 110,
    displaySize: 4,
    color: "#c9ddd8",
  }),
  body({
    id: "ganymede",
    name: "Ganymede",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 42,
    longitudeDeg: 200,
    displaySize: 5,
    color: "#b7a78c",
  }),
  body({
    id: "callisto",
    name: "Callisto",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 54,
    longitudeDeg: 300,
    displaySize: 4.5,
    color: "#8a8178",
  }),
  body({
    id: "titan",
    name: "Titan",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 38,
    longitudeDeg: 80,
    displaySize: 5,
    color: "#d4a15a",
  }),
  body({
    id: "enceladus",
    name: "Enceladus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 22,
    longitudeDeg: 250,
    displaySize: 3.5,
    color: "#e8f2f4",
  }),
  body({
    id: "iapetus",
    name: "Iapetus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 52,
    longitudeDeg: 175,
    displaySize: 4,
    color: "#9a8b78",
  }),
  body({
    id: "titania",
    name: "Titania",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 28,
    longitudeDeg: 60,
    displaySize: 4,
    color: "#b8c4d4",
  }),
  body({
    id: "oberon",
    name: "Oberon",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 38,
    longitudeDeg: 220,
    displaySize: 4,
    color: "#9aa6b8",
  }),
  body({
    id: "triton",
    name: "Triton",
    type: "moon",
    parentId: "neptune",
    au: 0,
    localOrbit: 28,
    longitudeDeg: 130,
    displaySize: 4.5,
    color: "#c5d0d8",
  }),
];

export function isHeliocentric(object: SolarObject): boolean {
  return object.type === "star" || object.type === "planet" || object.type === "dwarf-planet";
}

export function isLitInMode(object: SolarObject, mode: GameMode): boolean {
  if (mode === "planets") {
    return object.type === "star" || object.type === "planet";
  }
  return false;
}

export function objectById(id: string): SolarObject | undefined {
  return catalog.find((object) => object.id === id);
}
