import { catalog, isHeliocentric, type SolarObject } from "./catalog";
import type { Rng } from "./game";
import {
  minBodyGap,
  visualOrbit,
  type LayoutProfile,
} from "./layoutProfile";

export { layoutProfileForMode, visualOrbit, type LayoutProfile } from "./layoutProfile";

const MAX_SPAWN_ATTEMPTS = 200;

export type LaidOutObject = {
  x: number;
  y: number;
  radius: number;
};

function heliocentricLayout(
  object: SolarObject,
  profile: LayoutProfile = "compact",
): LaidOutObject {
  const orbit = visualOrbit(object.au, profile);
  const radians = (object.longitudeDeg * Math.PI) / 180;
  return {
    x: Math.cos(radians) * orbit,
    y: Math.sin(radians) * orbit,
    radius: object.displaySize,
  };
}

export function layoutAll(
  bodies: SolarObject[] = catalog,
  profile: LayoutProfile = "compact",
): Map<string, LaidOutObject> {
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
      const position = heliocentricLayout(object, profile);
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

export function regionBand(
  object: SolarObject,
  profile: LayoutProfile = "compact",
): { inner: number; outer: number } {
  return {
    inner: visualOrbit(object.innerAu, profile),
    outer: visualOrbit(object.au, profile),
  };
}

export function cameraFitRadius(
  objects: SolarObject[],
  profile: LayoutProfile = "compact",
): number {
  if (profile === "proportional") {
    return visualOrbit(14, profile) * 1.04;
  }
  const jupiter = objects.find((object) => object.id === "jupiter");
  return visualOrbit(jupiter?.au ?? 5.2, profile) * 1.08;
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

export type BeltAsteroid = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  variant: number;
  sprite: boolean;
};

export function beltAsteroids(
  inner: number,
  outer: number,
  count: number,
): BeltAsteroid[] {
  const rocks: BeltAsteroid[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = i * 2.399963 + Math.sin(i * 7.13) * 0.35;
    const t = (Math.sin(i * 12.9898 + 0.17) + 1) / 2;
    const radius = inner + (outer - inner) * (0.06 + t * 0.88);
    const size = 2.4 + (i % 5) * 1.6 + (i % 3) * 2.2;
    rocks.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size,
      rotation: (i * 47.31) % 360,
      variant: i % 6,
      sprite: i % 4 === 0 && size > 5,
    });
  }
  return rocks;
}

export function annulusPath(inner: number, outer: number): string {
  return [
    `M ${outer} 0`,
    `A ${outer} ${outer} 0 1 1 ${-outer} 0`,
    `A ${outer} ${outer} 0 1 1 ${outer} 0`,
    `M ${inner} 0`,
    `A ${inner} ${inner} 0 1 0 ${-inner} 0`,
    `A ${inner} ${inner} 0 1 0 ${inner} 0`,
  ].join(" ");
}

export function layoutObject(
  object: SolarObject,
  bodies: SolarObject[] = catalog,
  profile: LayoutProfile = "compact",
): LaidOutObject {
  return (
    layoutAll(bodies, profile).get(object.id) ??
    heliocentricLayout(object, profile)
  );
}

function shouldCheckOverlap(a: SolarObject, b: SolarObject): boolean {
  if (a.type === "region" || b.type === "region") {
    return false;
  }
  if (a.parentId === b.id || b.parentId === a.id) {
    return false;
  }
  return true;
}

function hasBodyOverlaps(
  bodies: SolarObject[],
  profile: LayoutProfile = "compact",
): boolean {
  const laid = layoutAll(bodies, profile);
  const gap = minBodyGap(profile);
  const physical = bodies.filter((object) => object.type !== "region");
  for (let i = 0; i < physical.length; i += 1) {
    for (let j = i + 1; j < physical.length; j += 1) {
      const first = physical[i]!;
      const second = physical[j]!;
      if (!shouldCheckOverlap(first, second)) {
        continue;
      }
      const a = laid.get(first.id);
      const b = laid.get(second.id);
      if (!a || !b) {
        continue;
      }
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance <= a.radius + b.radius + gap) {
        return true;
      }
    }
  }
  return false;
}

function shuffleIds(ids: string[], rng: Rng): string[] {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    const a = next[i]!;
    next[i] = next[j]!;
    next[j] = a;
  }
  return next;
}

function overlapsAtAngle(
  target: SolarObject,
  longitudeDeg: number,
  bodies: SolarObject[],
  profile: LayoutProfile,
): boolean {
  const trial = bodies.map((object) =>
    object.id === target.id ? { ...object, longitudeDeg } : object,
  );
  const laid = layoutAll(trial, profile);
  const gap = minBodyGap(profile);
  const at = laid.get(target.id);
  if (!at) {
    return false;
  }
  for (const other of bodies) {
    if (other.id === target.id || !shouldCheckOverlap(target, other)) {
      continue;
    }
    const otherAt = laid.get(other.id);
    if (!otherAt) {
      continue;
    }
    const distance = Math.hypot(at.x - otherAt.x, at.y - otherAt.y);
    if (distance <= at.radius + otherAt.radius + gap) {
      return true;
    }
  }
  return false;
}

export function randomizeOrbitalPositions(
  bodies: SolarObject[] = catalog,
  rng: Rng,
  profile: LayoutProfile = "compact",
): SolarObject[] {
  const orbital = bodies.filter(
    (object) => object.type !== "star" && object.type !== "region",
  );
  if (orbital.length === 0) {
    return bodies;
  }

  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt += 1) {
    const randomized = bodies.map((object) => {
      if (object.type === "star" || object.type === "region") {
        return object;
      }
      return { ...object, longitudeDeg: rng() * 360 };
    });
    if (!hasBodyOverlaps(randomized, profile)) {
      return randomized;
    }
  }

  const placed = new Map(bodies.map((object) => [object.id, { ...object }]));
  const order = shuffleIds(
    orbital
      .slice()
      .sort((a, b) => b.displaySize - a.displaySize)
      .map((object) => object.id),
    rng,
  );
  const snapshot = () => bodies.map((object) => placed.get(object.id)!);

  for (const id of order) {
    const target = placed.get(id)!;
    let angle = rng() * 360;
    let found = false;
    for (let tryIndex = 0; tryIndex < 120; tryIndex += 1) {
      angle = (angle + 137.508 + rng() * 48) % 360;
      target.longitudeDeg = angle;
      if (!overlapsAtAngle(target, angle, snapshot(), profile)) {
        found = true;
        break;
      }
    }
    if (!found) {
      target.longitudeDeg = rng() * 360;
    }
  }

  return snapshot();
}

/** One full trip around an orbit ring during gameplay (~8 minutes). */
export const ORBIT_ANIMATION_PERIOD_MS = 480_000;

/** Moons orbit their parent faster than planets lap the Sun, but stay slow enough to click. */
export const MOON_ORBIT_SPEED_MULTIPLIER = 2;

export function orbitPhaseDeg(
  elapsedMs: number,
  periodMs: number = ORBIT_ANIMATION_PERIOD_MS,
): number {
  const safePeriod = Math.max(periodMs, 1);
  const elapsed = ((elapsedMs % safePeriod) + safePeriod) % safePeriod;
  return (elapsed / safePeriod) * 360;
}

export function applyOrbitPhase(
  bodies: SolarObject[],
  heliocentricPhaseDeg: number,
  moonPhaseDeg: number = heliocentricPhaseDeg * MOON_ORBIT_SPEED_MULTIPLIER,
): SolarObject[] {
  if (heliocentricPhaseDeg === 0 && moonPhaseDeg === 0) {
    return bodies;
  }
  return bodies.map((object) => {
    if (object.type === "star" || object.type === "region") {
      return object;
    }
    if (object.type === "moon") {
      if (moonPhaseDeg === 0) {
        return object;
      }
      return {
        ...object,
        longitudeDeg: (object.longitudeDeg + moonPhaseDeg) % 360,
      };
    }
    if (isHeliocentric(object)) {
      if (heliocentricPhaseDeg === 0) {
        return object;
      }
      return {
        ...object,
        longitudeDeg: (object.longitudeDeg + heliocentricPhaseDeg) % 360,
      };
    }
    return object;
  });
}
