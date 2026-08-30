import { describe, expect, it } from "vitest";
import { catalog, objectsForMode } from "./catalog";

describe("solar system catalog", () => {
  it("includes the Sun and eight planets", () => {
    const names = catalog.map((object) => object.name);
    expect(names).toEqual([
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

  it("keeps planets parented to the Sun", () => {
    const mercury = catalog.find((object) => object.id === "mercury");
    expect(mercury).toMatchObject({
      type: "planet",
      parentId: "sun",
    });
  });

  it("shows only the Sun and planets in planets mode", () => {
    const names = objectsForMode("planets").map((object) => object.name);
    expect(names).toEqual([
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
});
