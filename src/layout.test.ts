import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import { layoutObject } from "./layout";

describe("compressed visual layout", () => {
  it("pins the Sun at the origin", () => {
    const sun = catalog.find((object) => object.id === "sun")!;
    expect(layoutObject(sun)).toEqual({ x: 0, y: 0, radius: sun.displaySize });
  });

  it("places Neptune farther from the Sun than Mercury", () => {
    const mercury = catalog.find((object) => object.id === "mercury")!;
    const neptune = catalog.find((object) => object.id === "neptune")!;
    const mercuryLayout = layoutObject(mercury);
    const neptuneLayout = layoutObject(neptune);
    const mercuryDistance = Math.hypot(mercuryLayout.x, mercuryLayout.y);
    const neptuneDistance = Math.hypot(neptuneLayout.x, neptuneLayout.y);
    expect(neptuneDistance).toBeGreaterThan(mercuryDistance * 3);
  });

  it("keeps Mercury clickable by not collapsing inner orbits", () => {
    const mercury = catalog.find((object) => object.id === "mercury")!;
    const { x, y } = layoutObject(mercury);
    expect(Math.hypot(x, y)).toBeGreaterThan(40);
  });
});
