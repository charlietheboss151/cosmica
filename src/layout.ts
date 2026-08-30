import { catalog, isHeliocentric, type SolarObject } from "./catalog";

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

function heliocentricLayout(object: SolarObject): LaidOutObject {
  const orbit = visualOrbit(object.au);
  const radians = (object.longitudeDeg * Math.PI) / 180;
  return {
    x: Math.cos(radians) * orbit,
    y: Math.sin(radians) * orbit,
    radius: object.displaySize,
  };
}

export function layoutAll(bodies: SolarObject[] = catalog): Map<string, LaidOutObject> {
  const byId = new Map(bodies.map((object) => [object.id, object]));
  const laid = new Map<string, LaidOutObject>();

  const place = (id: string): LaidOutObject => {
    const existing = laid.get(id);
    if (existing) {
      return existing;
    }
    const object = byId.get(id);
    if (!object) {
      return { x: 0, y: 0, radius: 0 };
    }
    if (object.type === "region") {
      const position = { x: 0, y: 0, radius: 0 };
      laid.set(id, position);
      return position;
    }
    if (isHeliocentric(object)) {
      const position = heliocentricLayout(object);
      laid.set(id, position);
      return position;
    }
    const parent = object.parentId ? place(object.parentId) : { x: 0, y: 0, radius: 0 };
    const radians = (object.longitudeDeg * Math.PI) / 180;
    const position = {
      x: parent.x + Math.cos(radians) * object.localOrbit,
      y: parent.y + Math.sin(radians) * object.localOrbit,
      radius: object.displaySize,
    };
    laid.set(id, position);
    return position;
  };

  for (const object of bodies) {
    place(object.id);
  }
  return laid;
}

export function regionBand(object: SolarObject): { inner: number; outer: number } {
  return {
    inner: visualOrbit(object.innerAu),
    outer: visualOrbit(object.au),
  };
}

export function cameraFitRadius(objects: SolarObject[]): number {
  const sun = objects.find((object) => object.type === "star");
  return (sun?.displaySize ?? 80) * 2.4;
}

export function beltDust(
  inner: number,
  outer: number,
  count: number,
): { x: number; y: number; r: number }[] {
  const dots = [];
  for (let i = 0; i < count; i += 1) {
    const angle = i * 2.399;
    const t = (Math.sin(i * 12.989) + 1) / 2;
    const radius = inner + (outer - inner) * t;
    dots.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      r: 0.7 + (i % 4) * 0.35,
    });
  }
  return dots;
}

export function layoutObject(
  object: SolarObject,
  bodies: SolarObject[] = catalog,
): LaidOutObject {
  return layoutAll(bodies).get(object.id) ?? heliocentricLayout(object);
}
