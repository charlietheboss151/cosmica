import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import { cameraFitRadius, layoutObject, regionBand, visualOrbit } from "./layout";

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

  it("places Europa around Jupiter instead of on a solar orbit", () => {
    const jupiter = catalog.find((object) => object.id === "jupiter")!;
    const europa = catalog.find((object) => object.id === "europa")!;
    const j = layoutObject(jupiter);
    const e = layoutObject(europa);
    const separation = Math.hypot(e.x - j.x, e.y - j.y);
    expect(separation).toBeGreaterThan(jupiter.displaySize);
    expect(separation).toBeLessThan(jupiter.displaySize + 90);
  });

  it("places the Asteroid Belt between Mars and Jupiter", () => {
    const belt = catalog.find((object) => object.id === "asteroid-belt")!;
    const mars = visualOrbit(catalog.find((object) => object.id === "mars")!.au);
    const jupiter = visualOrbit(
      catalog.find((object) => object.id === "jupiter")!.au,
    );
    const { inner, outer } = regionBand(belt);
    expect(inner).toBeGreaterThan(mars);
    expect(outer).toBeLessThan(jupiter);
  });

  it("keeps the Sun and planets from overlapping", () => {
    const worlds = catalog.filter(
      (object) => object.type === "star" || object.type === "planet",
    );
    const laid = worlds.map((object) => ({
      object,
      at: layoutObject(object),
    }));
    for (let i = 0; i < laid.length; i += 1) {
      for (let j = i + 1; j < laid.length; j += 1) {
        const a = laid[i]!;
        const b = laid[j]!;
        const distance = Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y);
        expect(
          distance,
          `${a.object.name} vs ${b.object.name}`,
        ).toBeGreaterThan(a.at.radius + b.at.radius + 12);
      }
    }
  });

  it("frames the first view around the inner system through Jupiter", () => {
    const mars = catalog.find((object) => object.id === "mars")!;
    const jupiter = catalog.find((object) => object.id === "jupiter")!;
    const saturn = catalog.find((object) => object.id === "saturn")!;
    const fit = cameraFitRadius(catalog);
    expect(fit).toBeGreaterThan(visualOrbit(mars.au));
    expect(fit).toBeGreaterThan(visualOrbit(jupiter.au));
    expect(fit).toBeLessThan(visualOrbit(saturn.au));
  });
});
