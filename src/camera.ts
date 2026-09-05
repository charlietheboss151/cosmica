export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

const MIN_ZOOM = 0.22;
const MAX_ZOOM = 8;

export function createCamera(): Camera {
  return { x: 0, y: 0, zoom: 1 };
}

export function fitCamera(
  maxRadius: number,
  width: number,
  height: number,
): Camera {
  const span = Math.min(width, height) * 0.5;
  const zoom = Math.min(
    MAX_ZOOM,
    Math.max(MIN_ZOOM, span / Math.max(maxRadius, 1)),
  );
  return { x: 0, y: 0, zoom };
}

export function screenToWorld(
  camera: Camera,
  screenX: number,
  screenY: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: (screenX - width / 2) / camera.zoom + camera.x,
    y: (screenY - height / 2) / camera.zoom + camera.y,
  };
}

export function panCamera(camera: Camera, dx: number, dy: number): Camera {
  return {
    ...camera,
    x: camera.x - dx / camera.zoom,
    y: camera.y - dy / camera.zoom,
  };
}

const KEYBOARD_PAN_KEYS = new Set([
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "w",
  "a",
  "s",
  "d",
]);

export function isKeyboardPanKey(key: string): boolean {
  return KEYBOARD_PAN_KEYS.has(key.toLowerCase());
}

/** Screen-pixel pan speed while WASD / arrows are held. */
export const KEYBOARD_PAN_PX_PER_SEC = 520;
/** How quickly pan speed eases toward the held-key target (higher = snappier). */
export const KEYBOARD_PAN_SMOOTHING = 16;

export type PanVelocity = { vx: number; vy: number };

export function createPanVelocity(): PanVelocity {
  return { vx: 0, vy: 0 };
}

/** Screen-pixel pan rate for held WASD / arrow keys (same axes as drag-to-pan). */
export function keyboardPanDelta(
  keys: ReadonlySet<string>,
  speed: number,
): { dx: number; dy: number } {
  const held = new Set([...keys].map((key) => key.toLowerCase()));
  let dx = 0;
  let dy = 0;
  if (held.has("arrowleft") || held.has("a")) {
    dx += speed;
  }
  if (held.has("arrowright") || held.has("d")) {
    dx -= speed;
  }
  if (held.has("arrowup") || held.has("w")) {
    dy += speed;
  }
  if (held.has("arrowdown") || held.has("s")) {
    dy -= speed;
  }
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.SQRT2;
    dx *= inv;
    dy *= inv;
  }
  return { dx, dy };
}

/**
 * One animation-frame of keyboard panning: ease velocity toward held keys,
 * then return the screen-pixel delta to apply this frame.
 */
export function keyboardPanFrame(
  keys: ReadonlySet<string>,
  velocity: PanVelocity,
  dtSec: number,
  options: { reducedMotion?: boolean } = {},
): { velocity: PanVelocity; dx: number; dy: number; active: boolean } {
  const dt = Number.isFinite(dtSec) ? Math.min(0.05, Math.max(0, dtSec)) : 0;
  const target = keyboardPanDelta(keys, KEYBOARD_PAN_PX_PER_SEC);
  const blend = options.reducedMotion
    ? 1
    : 1 - Math.exp(-KEYBOARD_PAN_SMOOTHING * dt);
  const vx = velocity.vx + (target.dx - velocity.vx) * blend;
  const vy = velocity.vy + (target.dy - velocity.vy) * blend;
  const still =
    target.dx === 0 &&
    target.dy === 0 &&
    Math.hypot(vx, vy) < 8;
  if (still) {
    return { velocity: createPanVelocity(), dx: 0, dy: 0, active: false };
  }
  return {
    velocity: { vx, vy },
    dx: vx * dt,
    dy: vy * dt,
    active: true,
  };
}

export function focusCameraOnBody(
  camera: Camera,
  x: number,
  y: number,
  _width: number,
  _height: number,
  zoom = 3,
): Camera {
  const nextZoom = Math.min(MAX_ZOOM, Math.max(camera.zoom, zoom));
  return {
    x,
    y,
    zoom: nextZoom,
  };
}

export function zoomCamera(
  camera: Camera,
  factor: number,
  screenX: number,
  screenY: number,
  width: number,
  height: number,
): Camera {
  const pivot = screenToWorld(camera, screenX, screenY, width, height);
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * factor));
  return {
    zoom,
    x: pivot.x - (screenX - width / 2) / zoom,
    y: pivot.y - (screenY - height / 2) / zoom,
  };
}

/** Wheel / trackpad zoom; ctrl+wheel is how browsers expose pinch. */
export function wheelZoomFactor(deltaY: number, ctrlKey = false): number {
  if (ctrlKey) {
    return Math.exp(-deltaY * 0.01);
  }
  return deltaY < 0 ? 1.12 : 1 / 1.12;
}

export function pinchDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function cameraTransform(
  camera: Camera,
  width: number,
  height: number,
): string {
  return `translate(${width / 2} ${height / 2}) scale(${camera.zoom}) translate(${-camera.x} ${-camera.y})`;
}

/** Convert a target on-screen size in CSS pixels to world units at this zoom. */
export function screenPxToWorld(px: number, zoom: number): number {
  return px / Math.max(zoom, MIN_ZOOM);
}

/** Default time to glide the camera to a missed moon. */
export const CAMERA_GLIDE_MS = 1200;

export function easeInOutCubic(t: number): number {
  const k = Math.min(1, Math.max(0, t));
  return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
}

export function lerpCamera(from: Camera, to: Camera, t: number): Camera {
  const k = Math.min(1, Math.max(0, t));
  return {
    x: from.x + (to.x - from.x) * k,
    y: from.y + (to.y - from.y) * k,
    zoom: from.zoom + (to.zoom - from.zoom) * k,
  };
}

export function camerasNear(a: Camera, b: Camera, epsilon = 0.5): boolean {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.zoom - b.zoom) < 0.03
  );
}
