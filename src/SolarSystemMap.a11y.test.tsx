import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog } from "./catalog";
import SolarSystemMap from "./SolarSystemMap";

describe("SolarSystemMap accessibility", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 800,
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 600,
    });
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
    Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
    vi.unstubAllGlobals();
  });

  it("lets arrow keys pan and plus/minus zoom when the map is focused", () => {
    const { container } = render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={vi.fn()} />,
    );
    const svg = container.querySelector(".map-svg") as SVGSVGElement;
    expect(svg).toHaveAttribute("tabindex", "0");
    const world = svg.querySelector("g")!;
    const before = world.getAttribute("transform") ?? "";
    svg.focus();
    fireEvent.keyDown(svg, { key: "ArrowRight" });
    expect(world.getAttribute("transform")).not.toBe(before);
    const afterPan = world.getAttribute("transform") ?? "";
    fireEvent.keyDown(svg, { key: "+" });
    expect(world.getAttribute("transform")).not.toBe(afterPan);
  });

  it("skips orbit animation when the user prefers reduced motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const spy = vi.spyOn(window, "requestAnimationFrame");
    render(
      <SolarSystemMap
        objects={catalog}
        mode="planets"
        orbitStartMs={1_000}
        onSelect={vi.fn()}
      />,
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
