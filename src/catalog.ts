export type ObjectType =
  | "star"
  | "planet"
  | "moon"
  | "dwarf-planet"
  | "asteroid"
  | "comet"
  | "region";
export type GameMode = "planets" | "moons" | "celestial";

export type ModeOptions = {
  hardMode: boolean;
};

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
  hardOnly: boolean;
};

import { EXTRA_CATALOG } from "./extraCatalog";

function body(
  partial: Omit<SolarObject, "localOrbit" | "innerAu" | "hardOnly"> & {
    localOrbit?: number;
    innerAu?: number;
    hardOnly?: boolean;
  },
): SolarObject {
  return {
    localOrbit: 0,
    innerAu: 0,
    hardOnly: false,
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
    displaySize: 54,
    color: "#ffcc4d",
  }),
  body({
    id: "mercury",
    name: "Mercury",
    type: "planet",
    parentId: "sun",
    au: 0.387,
    longitudeDeg: 248,
    displaySize: 16,
    color: "#c5b8a4",
  }),
  body({
    id: "venus",
    name: "Venus",
    type: "planet",
    parentId: "sun",
    au: 0.723,
    longitudeDeg: 312,
    displaySize: 24,
    color: "#f0c56e",
  }),
  body({
    id: "earth",
    name: "Earth",
    type: "planet",
    parentId: "sun",
    au: 1,
    longitudeDeg: 157,
    displaySize: 26,
    color: "#4ea3ff",
  }),
  body({
    id: "mars",
    name: "Mars",
    type: "planet",
    parentId: "sun",
    au: 1.524,
    longitudeDeg: 84,
    displaySize: 20,
    color: "#ff6b3d",
  }),
  body({
    id: "ceres",
    name: "Ceres",
    type: "dwarf-planet",
    parentId: "sun",
    au: 2.77,
    longitudeDeg: 210,
    displaySize: 13,
    color: "#c4b8a8",
  }),
  body({
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    parentId: "sun",
    au: 5.203,
    longitudeDeg: 71,
    displaySize: 42,
    color: "#e0a05a",
  }),
  body({
    id: "saturn",
    name: "Saturn",
    type: "planet",
    parentId: "sun",
    au: 9.537,
    longitudeDeg: 341,
    displaySize: 38,
    color: "#f0d48a",
  }),
  body({
    id: "uranus",
    name: "Uranus",
    type: "planet",
    parentId: "sun",
    au: 19.191,
    longitudeDeg: 54,
    displaySize: 30,
    color: "#6ed4e0",
  }),
  body({
    id: "neptune",
    name: "Neptune",
    type: "planet",
    parentId: "sun",
    au: 30.069,
    longitudeDeg: 358,
    displaySize: 28,
    color: "#3d6fff",
  }),
  body({
    id: "pluto",
    name: "Pluto",
    type: "dwarf-planet",
    parentId: "sun",
    au: 39.48,
    longitudeDeg: 294,
    displaySize: 13,
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
    innerAu: 30,
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
    innerAu: 48,
    au: 62,
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
    id: "phobos",
    name: "Phobos",
    type: "moon",
    parentId: "mars",
    au: 0,
    localOrbit: 32,
    longitudeDeg: 70,
    displaySize: 8,
    color: "#c4a890",
  }),
  body({
    id: "deimos",
    name: "Deimos",
    type: "moon",
    parentId: "mars",
    au: 0,
    localOrbit: 46,
    longitudeDeg: 210,
    displaySize: 7,
    color: "#b8a090",
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
    id: "mimas",
    name: "Mimas",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 98,
    longitudeDeg: 18,
    displaySize: 9,
    color: "#d8d0c4",
  }),
  body({
    id: "enceladus",
    name: "Enceladus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 110,
    longitudeDeg: 62,
    displaySize: 10,
    color: "#e8f2f4",
  }),
  body({
    id: "tethys",
    name: "Tethys",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 122,
    longitudeDeg: 108,
    displaySize: 11,
    color: "#d4d8dc",
  }),
  body({
    id: "dione",
    name: "Dione",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 134,
    longitudeDeg: 156,
    displaySize: 11,
    color: "#c8c4bc",
  }),
  body({
    id: "rhea",
    name: "Rhea",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 148,
    longitudeDeg: 204,
    displaySize: 12,
    color: "#c0b8ae",
  }),
  body({
    id: "titan",
    name: "Titan",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 166,
    longitudeDeg: 252,
    displaySize: 16,
    color: "#d4a15a",
  }),
  body({
    id: "iapetus",
    name: "Iapetus",
    type: "moon",
    parentId: "saturn",
    au: 0,
    localOrbit: 188,
    longitudeDeg: 300,
    displaySize: 12,
    color: "#9a8b78",
  }),
  body({
    id: "miranda",
    name: "Miranda",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 46,
    longitudeDeg: 28,
    displaySize: 9,
    color: "#c5c8ce",
  }),
  body({
    id: "ariel",
    name: "Ariel",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 58,
    longitudeDeg: 96,
    displaySize: 11,
    color: "#c8d0d6",
  }),
  body({
    id: "umbriel",
    name: "Umbriel",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 70,
    longitudeDeg: 164,
    displaySize: 11,
    color: "#6e6a72",
  }),
  body({
    id: "titania",
    name: "Titania",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 84,
    longitudeDeg: 232,
    displaySize: 12,
    color: "#b8c4d4",
  }),
  body({
    id: "oberon",
    name: "Oberon",
    type: "moon",
    parentId: "uranus",
    au: 0,
    localOrbit: 98,
    longitudeDeg: 300,
    displaySize: 12,
    color: "#9aa6b8",
  }),
  body({
    id: "triton",
    name: "Triton",
    type: "moon",
    parentId: "neptune",
    au: 0,
    localOrbit: 58,
    longitudeDeg: 130,
    displaySize: 14,
    color: "#c5d0d8",
  }),
  ...EXTRA_CATALOG.map((entry) =>
    body({
      ...entry,
      innerAu: entry.innerAu ?? 0,
      localOrbit: entry.localOrbit ?? 0,
    }),
  ),
];

export function isHeliocentric(object: SolarObject): boolean {
  return (
    object.type === "star" ||
    object.type === "planet" ||
    object.type === "dwarf-planet" ||
    object.type === "asteroid" ||
    object.type === "comet"
  );
}

/** Moons in Planets mode are tiny scenery, not quiz targets. */
export const PLANETS_MODE_MOON_SCALE = 0.32;

export function isDecorativeMoon(object: SolarObject, mode: GameMode): boolean {
  return (mode === "planets" || mode === "celestial") && object.type === "moon";
}

export function displayRadius(object: SolarObject, mode: GameMode): number {
  if (isDecorativeMoon(object, mode)) {
    return Math.max(3, object.displaySize * PLANETS_MODE_MOON_SCALE);
  }
  if (
    mode === "celestial" &&
    (object.type === "dwarf-planet" ||
      object.type === "asteroid" ||
      object.type === "comet")
  ) {
    return object.displaySize + 3;
  }
  return object.displaySize;
}

export function isShownLit(
  object: SolarObject,
  mode: GameMode,
  options: ModeOptions = { hardMode: false },
): boolean {
  if (object.type === "star") {
    return true;
  }
  return isLitInMode(object, mode, options);
}

export function isLitInMode(
  object: SolarObject,
  mode: GameMode,
  options: ModeOptions = { hardMode: false },
): boolean {
  if (object.hardOnly && !options.hardMode) {
    return false;
  }
  if (mode === "planets") {
    return object.type === "star" || object.type === "planet";
  }
  if (mode === "moons") {
    return object.type === "moon";
  }
  if (mode === "celestial") {
    return (
      object.type === "dwarf-planet" ||
      object.type === "asteroid" ||
      object.type === "comet" ||
      object.type === "region"
    );
  }
  return false;
}

export function playableInMode(
  mode: GameMode,
  options: ModeOptions = { hardMode: false },
): SolarObject[] {
  return catalog.filter(
    (object) => isLitInMode(object, mode, options) && object.type !== "star",
  );
}

export function objectById(id: string): SolarObject | undefined {
  return catalog.find((object) => object.id === id);
}
