import type { SolarObject } from "./catalog";

export type LaidOutObject = {
  x: number;
  y: number;
  radius: number;
};

export function visualOrbit(au: number): number {
  if (au <= 0) {
    return 0;
  }
  return 55 + Math.pow(au, 0.58) * 105;
}

export function layoutObject(object: SolarObject): LaidOutObject {
  const orbit = visualOrbit(object.au);
  const radians = (object.longitudeDeg * Math.PI) / 180;
  return {
    x: Math.cos(radians) * orbit,
    y: Math.sin(radians) * orbit,
    radius: object.displaySize,
  };
}
