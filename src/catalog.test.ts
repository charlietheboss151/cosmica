import { describe, expect, it } from "vitest";
import { catalog, isLitInMode } from "./catalog";

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

  it("keeps moons, dwarf planets, and regions on the map but unlit in Planets mode", () => {
    const europa = catalog.find((object) => object.id === "europa")!;
    const ceres = catalog.find((object) => object.id === "ceres")!;
    const belt = catalog.find((object) => object.id === "asteroid-belt")!;
    expect(isLitInMode(europa, "planets")).toBe(false);
    expect(isLitInMode(ceres, "planets")).toBe(false);
    expect(isLitInMode(belt, "planets")).toBe(false);
  });

  it("draws the Sun and planets at cartoon overscale", () => {
    const sun = catalog.find((object) => object.id === "sun")!;
    const earth = catalog.find((object) => object.id === "earth")!;
    const jupiter = catalog.find((object) => object.id === "jupiter")!;
    expect(sun.displaySize).toBeGreaterThanOrEqual(70);
    expect(earth.displaySize).toBeGreaterThanOrEqual(36);
    expect(jupiter.displaySize).toBeGreaterThanOrEqual(55);
    expect(sun.displaySize).toBeGreaterThan(jupiter.displaySize);
  });
});
