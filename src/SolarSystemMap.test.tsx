import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog, MOONS_MODE_MIN_WORLD } from "./catalog";
import { layoutObject } from "./layout";
import SolarSystemMap from "./SolarSystemMap";

describe("SolarSystemMap interaction", () => {
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
  });

  it("reports region hits through onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SolarSystemMap
        objects={catalog}
        mode="celestial"
        hardMode={false}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Scattered Disc" }));
    expect(onSelect).toHaveBeenCalledWith("scattered-disc");
  });

  it("zooms the camera when the wheel scrolls", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    const svg = container.querySelector(".map-svg");
    expect(svg).not.toBeNull();
    const world = svg!.querySelector("g");
    const before = world!.getAttribute("transform") ?? "";
    fireEvent.wheel(svg!, {
      deltaY: -120,
      clientX: 400,
      clientY: 300,
    });
    const after = world!.getAttribute("transform") ?? "";
    expect(after).not.toBe(before);
    expect(after).toMatch(/scale\(/);
  });

  it("keeps Moons-mode moons at a world-size floor when zoomed in close", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap
        objects={catalog}
        mode="moons"
        focusId="europa"
        onSelect={onSelect}
      />,
    );
    const svg = container.querySelector(".map-svg")!;
    const image = () =>
      container.querySelector('[data-testid="art-europa"] image');
    fireEvent.wheel(svg, {
      deltaY: -120,
      clientX: 400,
      clientY: 300,
    });
    fireEvent.wheel(svg, {
      deltaY: -120,
      clientX: 400,
      clientY: 300,
    });
    const width = Number(image()!.getAttribute("width"));
    expect(width).toBeGreaterThanOrEqual(MOONS_MODE_MIN_WORLD * 2);
  });

  it("does not snap orbiting moons back to rest after a miss re-render", () => {
    const start = 2_000_000;
    vi.spyOn(Date, "now").mockReturnValue(start + 90_000);
    const onSelect = vi.fn();
    const { container, rerender } = render(
      <SolarSystemMap
        objects={catalog}
        mode="moons"
        focusId="europa"
        orbitStartMs={start}
        onSelect={onSelect}
      />,
    );
    const europa = () => container.querySelector('[aria-label="Europa"]');
    const rest = layoutObject(
      catalog.find((object) => object.id === "europa")!,
      catalog,
      "compact",
    );
    const transform = europa()!.getAttribute("transform");
    expect(transform).not.toBe(`translate(${rest.x} ${rest.y})`);

    rerender(
      <SolarSystemMap
        objects={catalog}
        mode="moons"
        focusId="europa"
        flashId="io"
        orbitStartMs={start}
        onSelect={onSelect}
      />,
    );
    expect(europa()!.getAttribute("transform")).toBe(transform);
    vi.restoreAllMocks();
  });

  it("keeps the Moons-mode camera on the same parent after a miss", () => {
    const onSelect = vi.fn();
    const { container, rerender } = render(
      <SolarSystemMap
        objects={catalog}
        mode="moons"
        focusId="europa"
        onSelect={onSelect}
      />,
    );
    const world = () => container.querySelector(".map-svg > g");
    const before = world()!.getAttribute("transform");
    rerender(
      <SolarSystemMap
        objects={catalog}
        mode="moons"
        focusId="europa"
        flashId="io"
        onSelect={onSelect}
      />,
    );
    expect(world()!.getAttribute("transform")).toBe(before);

    rerender(
      <SolarSystemMap
        objects={catalog}
        mode="moons"
        focusId="io"
        onSelect={onSelect}
      />,
    );
    expect(world()!.getAttribute("transform")).toBe(before);
  });

  it("pans the camera on pointer drag", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    const svg = container.querySelector(".map-svg")!;
    const world = svg.querySelector("g")!;
    const before = world.getAttribute("transform") ?? "";
    fireEvent.pointerDown(svg, { button: 0, clientX: 400, clientY: 300 });
    fireEvent.pointerMove(svg, { clientX: 340, clientY: 300 });
    fireEvent.pointerUp(svg);
    const after = world.getAttribute("transform") ?? "";
    expect(after).not.toBe(before);
  });
});
