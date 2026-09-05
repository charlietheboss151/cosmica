import { fireEvent, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CAMERA_GLIDE_MS } from "./camera";
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

  it("zooms out when two pointers pinch together", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    const svg = container.querySelector(".map-svg")!;
    const world = svg.querySelector("g")!;
    const scaleOf = (transform: string) =>
      Number(/scale\(([^)]+)\)/.exec(transform)?.[1]);
    fireEvent.pointerDown(svg, {
      pointerId: 1,
      button: 0,
      clientX: 300,
      clientY: 300,
    });
    fireEvent.pointerDown(svg, {
      pointerId: 2,
      button: 0,
      clientX: 500,
      clientY: 300,
    });
    const before = scaleOf(world.getAttribute("transform") ?? "");
    fireEvent.pointerMove(svg, { pointerId: 1, clientX: 360, clientY: 300 });
    fireEvent.pointerMove(svg, { pointerId: 2, clientX: 440, clientY: 300 });
    const after = scaleOf(world.getAttribute("transform") ?? "");
    expect(after).toBeLessThan(before);
  });

  it("zooms out on ctrl-wheel, the browser pinch gesture", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    const svg = container.querySelector(".map-svg")!;
    const world = svg.querySelector("g")!;
    const scaleOf = (transform: string) =>
      Number(/scale\(([^)]+)\)/.exec(transform)?.[1]);
    fireEvent.wheel(svg, {
      deltaY: -120,
      ctrlKey: false,
      clientX: 400,
      clientY: 300,
    });
    const zoomedIn = scaleOf(world.getAttribute("transform") ?? "");
    fireEvent.wheel(svg, {
      deltaY: 80,
      ctrlKey: true,
      clientX: 400,
      clientY: 300,
    });
    const zoomedOut = scaleOf(world.getAttribute("transform") ?? "");
    expect(zoomedOut).toBeLessThan(zoomedIn);
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

  it("glides to a missed moon instead of jumping to the next planet", () => {
    const rafQueue: FrameRequestCallback[] = [];
    vi.spyOn(performance, "now").mockReturnValue(0);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => undefined);

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
    const before = world()!.getAttribute("transform") ?? "";
    const europa = layoutObject(
      catalog.find((object) => object.id === "europa")!,
      catalog,
      "compact",
    );
    const titan = layoutObject(
      catalog.find((object) => object.id === "titan")!,
      catalog,
      "compact",
    );

    rerender(
      <SolarSystemMap
        objects={catalog}
        mode="moons"
        focusId="titan"
        revealId="europa"
        onSelect={onSelect}
      />,
    );
    expect(world()!.getAttribute("transform")).toBe(before);

    const tick = rafQueue.at(-1);
    expect(tick).toBeTypeOf("function");
    act(() => {
      tick?.(CAMERA_GLIDE_MS);
    });
    const after = world()!.getAttribute("transform") ?? "";
    expect(after).not.toBe(before);
    const xy = (transform: string) => {
      const parts = [...transform.matchAll(/translate\(([^)]+)\)/g)];
      const last = parts.at(-1)?.[1]?.split(/\s+/) ?? [];
      return { x: -Number(last[0]), y: -Number(last[1]) };
    };
    const at = xy(after);
    const distEuropa = Math.hypot(at.x - europa.x, at.y - europa.y);
    const distTitan = Math.hypot(at.x - titan.x, at.y - titan.y);
    expect(distEuropa).toBeLessThan(distTitan);

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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

  it("pans on a touch drag even if the pointer button is -1", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    const svg = container.querySelector(".map-svg")!;
    const world = svg.querySelector("g")!;
    const before = world.getAttribute("transform") ?? "";
    fireEvent.pointerDown(svg, {
      pointerId: 1,
      pointerType: "touch",
      button: -1,
      clientX: 400,
      clientY: 300,
    });
    fireEvent.pointerMove(svg, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 330,
      clientY: 300,
    });
    expect(world.getAttribute("transform")).not.toBe(before);
  });

  it("still selects a planet on tap", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    await user.click(screen.getByRole("button", { name: "Mercury" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("mercury");
  });

  it("selects a planet on pointer up even if click never fires", () => {
    const onSelect = vi.fn();
    render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    const mercury = screen.getByRole("button", { name: "Mercury" });
    fireEvent.pointerDown(mercury, {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: 400,
      clientY: 300,
    });
    fireEvent.pointerUp(mercury, {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: 400,
      clientY: 300,
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("mercury");
  });

  it("pans when the drag starts on a planet and does not count that as a tap", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap objects={catalog} mode="planets" onSelect={onSelect} />,
    );
    const svg = container.querySelector(".map-svg")!;
    const world = svg.querySelector("g")!;
    const mercury = screen.getByRole("button", { name: "Mercury" });
    const before = world.getAttribute("transform") ?? "";
    fireEvent.pointerDown(mercury, {
      pointerId: 1,
      pointerType: "touch",
      button: -1,
      clientX: 400,
      clientY: 300,
    });
    fireEvent.pointerMove(svg, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 320,
      clientY: 300,
    });
    expect(world.getAttribute("transform")).not.toBe(before);
    fireEvent.pointerUp(svg, { pointerId: 1, pointerType: "touch" });
    fireEvent.click(mercury);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
