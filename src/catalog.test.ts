import { describe, expect, it } from "vitest";
import {
  catalog,
  displayRadius,
  MOONS_MODE_SCREEN_MIN,
  MOONS_MODE_MIN_WORLD,
  isLitInMode,
  isShownLit,
  moonsOf,
  parentsWithMoons,
  playableInMode,
} from "./catalog";

describe("solar system catalog", () => {
  it("includes the Sun, eight planets, and other bodies on the same map", () => {
    const names = catalog.map((object) => object.name);
    expect(names).toEqual(expect.arrayContaining([
      "Sun",
      "Mercury",
      "Venus",
      "Earth",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Moon",
      "Europa",
      "Titan",
      "Ceres",
      "Pluto",
      "Asteroid Belt",
      "Kuiper Belt",
      "Oort Cloud",
    ]));
  });

  it("keeps planets parented to the Sun", () => {
    const mercury = catalog.find((object) => object.id === "mercury");
    expect(mercury).toMatchObject({
      type: "planet",
      parentId: "sun",
    });
  });

  it("lights only the Sun and planets in Planets mode", () => {
    const lit = catalog
      .filter((object) => isLitInMode(object, "planets"))
      .map((object) => object.name);
    expect(lit).toEqual([
      "Sun",
      "Mercury",
      "Venus",
      "Earth",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
    ]);
  });

  it("shows tiny decorative moons in Planets mode and keeps other bodies grayed", () => {
    const europa = catalog.find((object) => object.id === "europa")!;
    const ceres = catalog.find((object) => object.id === "ceres")!;
    const belt = catalog.find((object) => object.id === "asteroid-belt")!;
    expect(isLitInMode(europa, "planets")).toBe(false);
    expect(displayRadius(europa, "planets")).toBeLessThan(europa.displaySize);
    expect(isLitInMode(ceres, "planets")).toBe(false);
    expect(isLitInMode(belt, "planets")).toBe(false);
    expect(catalog.some((object) => object.id === "europa")).toBe(true);
  });

  it("lights dwarf planets, asteroids, comets, and regions in Celestial mode", () => {
    expect(isLitInMode(catalog.find((object) => object.id === "eris")!, "celestial")).toBe(
      true,
    );
    expect(isLitInMode(catalog.find((object) => object.id === "vesta")!, "celestial")).toBe(
      true,
    );
    expect(isLitInMode(catalog.find((object) => object.id === "halley")!, "celestial")).toBe(
      true,
    );
    expect(
      isLitInMode(catalog.find((object) => object.id === "scattered-disc")!, "celestial"),
    ).toBe(true);
    expect(isLitInMode(catalog.find((object) => object.id === "earth")!, "celestial")).toBe(
      false,
    );
    expect(
      isLitInMode(catalog.find((object) => object.id === "asteroid-belt")!, "celestial"),
    ).toBe(false);
    expect(
      isLitInMode(catalog.find((object) => object.id === "kuiper-belt")!, "celestial"),
    ).toBe(false);
  });

  it("keeps hard-only objects out of Celestial mode until hard mode is on", () => {
    const sedna = catalog.find((object) => object.id === "sedna")!;
    expect(isLitInMode(sedna, "celestial")).toBe(false);
    expect(isLitInMode(sedna, "celestial", { hardMode: true })).toBe(true);
  });

  it("adds every moon in hard Moons mode", () => {
    const base = catalog.filter((object) => isLitInMode(object, "moons")).length;
    const all = catalog.filter((object) =>
      isLitInMode(object, "moons", { hardMode: true }),
    ).length;
    expect(all).toBeGreaterThan(base);
    expect(isLitInMode(catalog.find((object) => object.id === "charon")!, "moons")).toBe(
      false,
    );
    expect(
      isLitInMode(catalog.find((object) => object.id === "charon")!, "moons", {
        hardMode: true,
      }),
    ).toBe(true);
  });

  it("includes each planet's main moons", () => {
    const moonsOf = (parentId: string) =>
      catalog
        .filter((object) => object.type === "moon" && object.parentId === parentId)
        .map((object) => object.id)
        .sort();
    expect(moonsOf("mercury")).toEqual([]);
    expect(moonsOf("venus")).toEqual([]);
    expect(moonsOf("earth")).toEqual(["moon"]);
    expect(moonsOf("mars")).toEqual(["deimos", "phobos"]);
    expect(moonsOf("pluto")).toEqual(["charon", "hydra", "kerberos", "nix", "styx"]);
    expect(moonsOf("jupiter")).toEqual([
      "amalthea",
      "callisto",
      "europa",
      "ganymede",
      "io",
    ]);
    expect(moonsOf("saturn")).toEqual([
      "dione",
      "enceladus",
      "hyperion",
      "iapetus",
      "mimas",
      "phoebe",
      "rhea",
      "tethys",
      "titan",
    ]);
    expect(moonsOf("uranus")).toEqual([
      "ariel",
      "miranda",
      "oberon",
      "puck",
      "titania",
      "umbriel",
    ]);
    expect(moonsOf("neptune")).toEqual(["nereid", "proteus", "triton"]);
  });

  it("lights only moons in Moons mode and keeps planets on the map but gray", () => {
    const lit = catalog
      .filter((object) => isLitInMode(object, "moons"))
      .map((object) => object.type);
    expect(new Set(lit)).toEqual(new Set(["moon"]));
    expect(isLitInMode(catalog.find((object) => object.id === "earth")!, "moons")).toBe(
      false,
    );
    expect(isLitInMode(catalog.find((object) => object.id === "europa")!, "moons")).toBe(
      true,
    );
    expect(catalog.some((object) => object.id === "earth")).toBe(true);
  });

  it("keeps small moons readable in Moons mode without a huge world radius", () => {
    const kerberos = catalog.find((object) => object.id === "kerberos")!;
    expect(kerberos.displaySize).toBeLessThan(11);
    expect(displayRadius(kerberos, "moons")).toBe(MOONS_MODE_SCREEN_MIN);
    expect(displayRadius(kerberos, "planets")).toBeLessThan(11);
  });

  it("shrinks Moons-mode moon world radius with zoom until a floor", () => {
    const europa = catalog.find((object) => object.id === "europa")!;
    const atOne = displayRadius(europa, "moons", 1);
    const atMild = displayRadius(europa, "moons", 1.4);
    expect(atOne).toBe(Math.max(europa.displaySize, MOONS_MODE_SCREEN_MIN));
    expect(atMild).toBeLessThan(atOne);
    expect(atMild * 1.4).toBeCloseTo(atOne);

    const atMax = displayRadius(europa, "moons", 8);
    expect(atMax).toBe(MOONS_MODE_MIN_WORLD);
    expect(atMax * 8).toBeGreaterThan(atOne);
  });

  it("limits Moons mode to selected parent planets", () => {
    const jupiterOnly = { hardMode: false, parentIds: ["jupiter"] };
    expect(isLitInMode(catalog.find((object) => object.id === "europa")!, "moons", jupiterOnly)).toBe(
      true,
    );
    expect(isLitInMode(catalog.find((object) => object.id === "phobos")!, "moons", jupiterOnly)).toBe(
      false,
    );
    expect(playableInMode("moons", jupiterOnly).every((object) => object.parentId === "jupiter")).toBe(
      true,
    );
    expect(parentsWithMoons(jupiterOnly).map((object) => object.id)).toEqual(["jupiter"]);
    expect(moonsOf("jupiter", jupiterOnly).map((object) => object.id).sort()).toEqual([
      "callisto",
      "europa",
      "ganymede",
      "io",
    ]);
  });

  it("draws the Sun and planets at cartoon overscale", () => {
    const sun = catalog.find((object) => object.id === "sun")!;
    const earth = catalog.find((object) => object.id === "earth")!;
    const jupiter = catalog.find((object) => object.id === "jupiter")!;
    expect(sun.displaySize).toBeGreaterThanOrEqual(48);
    expect(earth.displaySize).toBeGreaterThanOrEqual(22);
    expect(jupiter.displaySize).toBeGreaterThanOrEqual(36);
    expect(sun.displaySize).toBeGreaterThan(jupiter.displaySize);
  });

  it("keeps the Sun full color in every mode", () => {
    const sun = catalog.find((object) => object.id === "sun")!;
    expect(isShownLit(sun, "moons")).toBe(true);
    expect(isShownLit(sun, "celestial")).toBe(true);
    expect(isLitInMode(sun, "moons")).toBe(false);
  });
});
