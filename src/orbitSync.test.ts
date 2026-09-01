import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import { layoutObject, layoutProfileForMode } from "./layout";
import { syncOrbitDom } from "./orbitSync";

describe("syncOrbitDom", () => {
  it("moves a planet group transform when the heliocentric phase advances", () => {
    const profile = layoutProfileForMode("planets");
    const earth = catalog.find((object) => object.id === "earth")!;
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const bodies = new Map<string, SVGGElement | null>([["earth", group]]);
    const moons = new Map<string, SVGCircleElement | null>();

    syncOrbitDom(catalog, 0, 0, profile, bodies, moons);
    const base = group.getAttribute("transform");
    const expectedBase = layoutObject(earth, catalog, profile);
    expect(base).toBe(`translate(${expectedBase.x} ${expectedBase.y})`);

    syncOrbitDom(catalog, 90, 0, profile, bodies, moons);
    expect(group.getAttribute("transform")).not.toBe(base);
  });
});
