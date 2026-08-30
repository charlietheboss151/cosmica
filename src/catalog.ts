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
    displaySize: 82,
    color: "#ffcc4d",
  }),
  body({
    id: "mercury",
    name: "Mercury",
    type: "planet",
    parentId: "sun",
    au: 0.387,
    longitudeDeg: 248,
    displaySize: 28,
    color: "#c5b8a4",
  }),
  body({
    id: "venus",
    name: "Venus",
    type: "planet",
    parentId: "sun",
    au: 0.723,
    longitudeDeg: 312,
    displaySize: 40,
    color: "#f0c56e",
  }),
  body({
    id: "earth",
    name: "Earth",
    type: "planet",
    parentId: "sun",
    au: 1,
    longitudeDeg: 157,
    displaySize: 42,
    color: "#4ea3ff",
  }),
  body({
    id: "mars",
    name: "Mars",
    type: "planet",
    parentId: "sun",
    au: 1.524,
    longitudeDeg: 84,
    displaySize: 36,
    color: "#ff6b3d",
  }),
  body({
    id: "ceres",
    name: "Ceres",
    type: "dwarf-planet",
    parentId: "sun",
    au: 2.77,
    longitudeDeg: 210,
    displaySize: 16,
    color: "#c4b8a8",
  }),
  body({
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    parentId: "sun",
    au: 5.203,
    longitudeDeg: 71,
    displaySize: 72,
    color: "#e0a05a",
  }),
  body({
    id: "saturn",
    name: "Saturn",
    type: "planet",
    parentId: "sun",
    au: 9.537,
    longitudeDeg: 341,
    displaySize: 64,
    color: "#f0d48a",
  }),
  body({
    id: "uranus",
    name: "Uranus",
    type: "planet",
    parentId: "sun",
    au: 19.191,
    longitudeDeg: 54,
    displaySize: 50,
    color: "#6ed4e0",
  }),
  body({
    id: "neptune",
    name: "Neptune",
    type: "planet",
    parentId: "sun",
    au: 30.069,
    longitudeDeg: 358,
    displaySize: 48,
    color: "#3d6fff",
  }),
  body({
    id: "pluto",
    name: "Pluto",
    type: "dwarf-planet",
    parentId: "sun",
    au: 39.48,
    longitudeDeg: 294,
    displaySize: 16,
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
    localOrbit: 58,
    longitudeDeg: 40,
    displaySize: 12,
    color: "#d9d6d0",
  }),
  body({
    id: "io",
    name: "Io",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 92,
    longitudeDeg: 20,
    displaySize: 14,
    color: "#e8d36a",
  }),
  body({
    id: "europa",
    name: "Europa",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 112,
    longitudeDeg: 110,
    displaySize: 14,
    color: "#c9ddd8",
  }),
  body({
    id: "ganymede",
    name: "Ganymede",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 134,
    longitudeDeg: 200,
    displaySize: 16,
    color: "#b7a78c",
  }),
  body({
    id: "callisto",
    name: "Callisto",
    type: "moon",
    parentId: "jupiter",
    au: 0,
    localOrbit: 158,
    longitudeDeg: 300,
    displaySize: 14,
    color: "#8a8178",
  }),
  body({
    id: "titan",
    name: "Titan",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 92,
    longitudeDeg: 80,
    displaySize: 16,
    color: "#d4a15a",
  }),
  body({
    id: "enceladus",
    name: "Enceladus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 76,
    longitudeDeg: 250,
    displaySize: 10,
    color: "#e8f2f4",
  }),
  body({
    id: "iapetus",
    name: "Iapetus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 118,
    longitudeDeg: 175,
    displaySize: 12,
    color: "#9a8b78",
  }),
  body({
    id: "titania",
    name: "Titania",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 68,
    longitudeDeg: 60,
    displaySize: 12,
    color: "#b8c4d4",
  }),
  body({
    id: "oberon",
    name: "Oberon",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 86,
    longitudeDeg: 220,
    displaySize: 12,
    color: "#9aa6b8",
  }),
  body({
    id: "triton",
    name: "Triton",
    type: "moon",
    parentId: "neptune",
    au: 0,
    localOrbit: 68,
    longitudeDeg: 130,
    displaySize: 14,
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
