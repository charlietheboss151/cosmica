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

export function cameraTransform(
  camera: Camera,
  width: number,
  height: number,
): string {
  return `translate(${width / 2} ${height / 2}) scale(${camera.zoom}) translate(${-camera.x} ${-camera.y})`;
}
