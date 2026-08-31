import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog } from "./catalog";
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
    await user.click(screen.getByRole("button", { name: "Kuiper Belt" }));
    expect(onSelect).toHaveBeenCalledWith("kuiper-belt");
  });

  it("zooms the camera when the wheel scrolls", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap
        objects={catalog}
        mode="planets"
        onSelect={onSelect}
      />,
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

  it("pans the camera on pointer drag", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SolarSystemMap
        objects={catalog}
        mode="planets"
        onSelect={onSelect}
      />,
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
