import { describe, expect, it } from "vitest";
import { catalog, displayRadius, isLitInMode, isVisibleInMode } from "./catalog";

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
    expect(isVisibleInMode(europa, "planets")).toBe(true);
    expect(isLitInMode(europa, "planets")).toBe(false);
    expect(displayRadius(europa, "planets")).toBeLessThan(europa.displaySize);
    expect(isLitInMode(ceres, "planets")).toBe(false);
    expect(isLitInMode(belt, "planets")).toBe(false);
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

  it("lights only moons in Moons mode and keeps planets visible but gray", () => {
    const lit = catalog
      .filter((object) => isLitInMode(object, "moons"))
      .map((object) => object.type);
    expect(new Set(lit)).toEqual(new Set(["moon"]));
    expect(isVisibleInMode(catalog.find((object) => object.id === "earth")!, "moons")).toBe(
      true,
    );
    expect(isLitInMode(catalog.find((object) => object.id === "earth")!, "moons")).toBe(
      false,
    );
    expect(isVisibleInMode(catalog.find((object) => object.id === "europa")!, "moons")).toBe(
      true,
    );
    expect(isLitInMode(catalog.find((object) => object.id === "europa")!, "moons")).toBe(
      true,
    );
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
});
