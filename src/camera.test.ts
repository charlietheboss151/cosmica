import { describe, expect, it } from "vitest";
import {
  camerasNear,
  createCamera,
  createPanVelocity,
  easeInOutCubic,
  fitCamera,
  isKeyboardPanKey,
  keyboardPanDelta,
  keyboardPanFrame,
  KEYBOARD_PAN_PX_PER_SEC,
  lerpCamera,
  panCamera,
  pinchDistance,
  screenToWorld,
  screenPxToWorld,
  wheelZoomFactor,
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

  it("zooms out when pinch or ctrl-wheel shrinks, and in when they grow", () => {
    expect(wheelZoomFactor(120)).toBeLessThan(1);
    expect(wheelZoomFactor(-120)).toBeGreaterThan(1);
    expect(wheelZoomFactor(80, true)).toBeLessThan(1);
    expect(wheelZoomFactor(-80, true)).toBeGreaterThan(1);
    expect(pinchDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("converts a screen-pixel size into world units at the current zoom", () => {
    expect(screenPxToWorld(16, 1)).toBe(16);
    expect(screenPxToWorld(16, 4)).toBe(4);
  });

  it("maps held keys to the same pan axes as drag", () => {
    expect(keyboardPanDelta(new Set(["w"]), 10)).toEqual({ dx: 0, dy: 10 });
    expect(keyboardPanDelta(new Set(["d"]), 10)).toEqual({ dx: -10, dy: 0 });
    const diagonal = keyboardPanDelta(new Set(["arrowleft", "s"]), 10);
    expect(diagonal.dx).toBeCloseTo(10 / Math.SQRT2);
    expect(diagonal.dy).toBeCloseTo(-10 / Math.SQRT2);
  });

  it("eases keyboard pan instead of jumping a full step on the first frame", () => {
    const dt = 1 / 60;
    const first = keyboardPanFrame(new Set(["d"]), createPanVelocity(), dt);
    const full = KEYBOARD_PAN_PX_PER_SEC * dt;
    expect(first.active).toBe(true);
    expect(first.dx).toBeLessThan(0);
    expect(Math.abs(first.dx)).toBeLessThan(Math.abs(full));
    const later = keyboardPanFrame(new Set(["d"]), first.velocity, dt);
    expect(Math.abs(later.dx)).toBeGreaterThan(Math.abs(first.dx));
  });

  it("coasts to a stop after keys are released", () => {
    let velocity = createPanVelocity();
    for (let i = 0; i < 12; i += 1) {
      velocity = keyboardPanFrame(new Set(["w"]), velocity, 1 / 60).velocity;
    }
    const coast = keyboardPanFrame(new Set(), velocity, 1 / 60);
    expect(coast.active).toBe(true);
    expect(coast.dy).toBeGreaterThan(0);
    expect(coast.dy).toBeLessThan(KEYBOARD_PAN_PX_PER_SEC / 60);
  });

  it("eases a camera glide toward the target instead of snapping", () => {
    const from = { x: 0, y: 0, zoom: 1 };
    const to = { x: 100, y: 40, zoom: 3 };
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    const mid = lerpCamera(from, to, easeInOutCubic(0.5));
    expect(mid.x).toBeGreaterThan(0);
    expect(mid.x).toBeLessThan(100);
    expect(camerasNear(lerpCamera(from, to, 1), to)).toBe(true);
    expect(camerasNear(from, to)).toBe(false);
  });
});
