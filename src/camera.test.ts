import { describe, expect, it } from "vitest";
import {
  createCamera,
  fitCamera,
  isKeyboardPanKey,
  keyboardPanDelta,
  panCamera,
  screenToWorld,
  zoomCamera,
} from "./camera";

describe("map camera", () => {
  it("starts centered on the Sun", () => {
    const camera = createCamera();
    expect(screenToWorld(camera, 400, 300, 800, 600)).toEqual({ x: 0, y: 0 });
  });

  it("pans so a drag moves the view", () => {
    const camera = panCamera(createCamera(), 80, 0);
    const world = screenToWorld(camera, 400, 300, 800, 600);
    expect(world.x).toBeLessThan(0);
  });

  it("zooms toward a screen point without jumping that world position", () => {
    const camera = createCamera();
    const pivot = screenToWorld(camera, 500, 280, 800, 600);
    const zoomed = zoomCamera(camera, 2, 500, 280, 800, 600);
    const after = screenToWorld(zoomed, 500, 280, 800, 600);
    expect(after.x).toBeCloseTo(pivot.x);
    expect(after.y).toBeCloseTo(pivot.y);
    expect(zoomed.zoom).toBe(2);
  });

  it("fits a far orbit inside the viewport", () => {
    const camera = fitCamera(400, 800, 600);
    const edge = screenToWorld(camera, 400, 0, 800, 600);
    expect(Math.abs(edge.y)).toBeGreaterThanOrEqual(400);
  });

  it("recognizes WASD and arrow keys for panning", () => {
    expect(isKeyboardPanKey("w")).toBe(true);
    expect(isKeyboardPanKey("ArrowLeft")).toBe(true);
    expect(isKeyboardPanKey("Enter")).toBe(false);
  });

  it("maps held keys to the same pan axes as drag", () => {
    expect(keyboardPanDelta(new Set(["w"]), 10)).toEqual({ dx: 0, dy: 10 });
    expect(keyboardPanDelta(new Set(["d"]), 10)).toEqual({ dx: -10, dy: 0 });
    expect(keyboardPanDelta(new Set(["arrowleft", "s"]), 10)).toEqual({
      dx: 10,
      dy: -10,
    });
  });
});
