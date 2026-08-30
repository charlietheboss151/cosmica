export type ObjectType = "star" | "planet" | "moon" | "dwarf-planet" | "region";
export type GameMode = "planets";

export type SolarObject = {
  id: string;
  name: string;
  type: ObjectType;
  parentId: string | null;
  au: number;
  innerAu: number;
  localOrbit: number;
  longitudeDeg: number;
  displaySize: number;
  color: string;
  difficulty: number;
};

function body(
  partial: Omit<SolarObject, "localOrbit" | "difficulty" | "innerAu"> & {
    localOrbit?: number;
    difficulty?: number;
    innerAu?: number;
  },
): SolarObject {
  return {
    localOrbit: 0,
    innerAu: 0,
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
    displaySize: 38,
    color: "#ffd36a",
  }),
  body({
    id: "mercury",
    name: "Mercury",
    type: "planet",
    parentId: "sun",
    au: 0.387,
    longitudeDeg: 248,
    displaySize: 12,
    color: "#c5c0b8",
  }),
  body({
    id: "venus",
    name: "Venus",
    type: "planet",
    parentId: "sun",
    au: 0.723,
    longitudeDeg: 312,
    displaySize: 18,
    color: "#e8c27a",
  }),
  body({
    id: "earth",
    name: "Earth",
    type: "planet",
    parentId: "sun",
    au: 1,
    longitudeDeg: 157,
    displaySize: 18,
    color: "#6ea8ff",
  }),
  body({
    id: "mars",
    name: "Mars",
    type: "planet",
    parentId: "sun",
    au: 1.524,
    longitudeDeg: 84,
    displaySize: 15,
    color: "#e07a4d",
  }),
  body({
    id: "ceres",
    name: "Ceres",
    type: "dwarf-planet",
    parentId: "sun",
    au: 2.77,
    longitudeDeg: 210,
    displaySize: 8,
    color: "#c4b8a8",
  }),
  body({
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    parentId: "sun",
    au: 5.203,
    longitudeDeg: 71,
    displaySize: 40,
    color: "#d4a574",
  }),
  body({
    id: "saturn",
    name: "Saturn",
    type: "planet",
    parentId: "sun",
    au: 9.537,
    longitudeDeg: 341,
    displaySize: 36,
    color: "#ead29a",
  }),
  body({
    id: "uranus",
    name: "Uranus",
    type: "planet",
    parentId: "sun",
    au: 19.191,
    longitudeDeg: 54,
    displaySize: 26,
    color: "#7ec8d4",
  }),
  body({
    id: "neptune",
    name: "Neptune",
    type: "planet",
    parentId: "sun",
    au: 30.069,
    longitudeDeg: 358,
    displaySize: 25,
    color: "#4d7fff",
  }),
  body({
    id: "pluto",
    name: "Pluto",
    type: "dwarf-planet",
    parentId: "sun",
    au: 39.48,
    longitudeDeg: 294,
    displaySize: 8,
    color: "#d6c4b0",
  }),
  body({
    id: "asteroid-belt",
    name: "Asteroid Belt",
    type: "region",
    parentId: "sun",
    innerAu: 2.2,
    au: 3.3,
    longitudeDeg: 0,
    displaySize: 0,
    color: "#c4b48a",
  }),
  body({
    id: "kuiper-belt",
    name: "Kuiper Belt",
    type: "region",
    parentId: "sun",
    innerAu: 32,
    au: 48,
    longitudeDeg: 0,
    displaySize: 0,
    color: "#7a8eaa",
  }),
  body({
    id: "oort-cloud",
    name: "Oort Cloud",
    type: "region",
    parentId: "sun",
    innerAu: 70,
    au: 105,
    longitudeDeg: 0,
    displaySize: 0,
    color: "#5a6578",
  }),
  body({
    id: "moon",
    name: "Moon",
    type: "moon",
    parentId: "earth",
    au: 0,
    localOrbit: 32,
    longitudeDeg: 40,
    displaySize: 6,
    color: "#d9d6d0",
  }),
  body({
    id: "io",
    name: "Io",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 52,
    longitudeDeg: 20,
    displaySize: 7,
    color: "#e8d36a",
  }),
  body({
    id: "europa",
    name: "Europa",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 66,
    longitudeDeg: 110,
    displaySize: 7,
    color: "#c9ddd8",
  }),
  body({
    id: "ganymede",
    name: "Ganymede",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 82,
    longitudeDeg: 200,
    displaySize: 8,
    color: "#b7a78c",
  }),
  body({
    id: "callisto",
    name: "Callisto",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 100,
    longitudeDeg: 300,
    displaySize: 7,
    color: "#8a8178",
  }),
  body({
    id: "titan",
    name: "Titan",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 58,
    longitudeDeg: 80,
    displaySize: 8,
    color: "#d4a15a",
  }),
  body({
    id: "enceladus",
    name: "Enceladus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 44,
    longitudeDeg: 250,
    displaySize: 5,
    color: "#e8f2f4",
  }),
  body({
    id: "iapetus",
    name: "Iapetus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 78,
    longitudeDeg: 175,
    displaySize: 6,
    color: "#9a8b78",
  }),
  body({
    id: "titania",
    name: "Titania",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 42,
    longitudeDeg: 60,
    displaySize: 6,
    color: "#b8c4d4",
  }),
  body({
    id: "oberon",
    name: "Oberon",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 56,
    longitudeDeg: 220,
    displaySize: 6,
    color: "#9aa6b8",
  }),
  body({
    id: "triton",
    name: "Triton",
    type: "moon",
    parentId: "neptune",
    au: 0,
    localOrbit: 42,
    longitudeDeg: 130,
    displaySize: 7,
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
