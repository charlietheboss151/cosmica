import type { GameMode } from "./catalog";

export type LayoutProfile = "compact" | "proportional";

export function layoutProfileForMode(mode: GameMode): LayoutProfile {
  return mode === "celestial" ? "proportional" : "compact";
}

/** Scales moon/local orbit radii to match tighter heliocentric spacing. */
export const LOCAL_ORBIT_SCALE = 0.62;

const PROPORTIONAL_BASE = 56;
const PROPORTIONAL_AU_SCALE = 48;
const PROPORTIONAL_OUTER_AU = 50;
const PROPORTIONAL_LOG_SCALE = 240;

const COMPACT_BASE = 52;
const COMPACT_AU_SCALE = 100;

export function visualOrbit(
  au: number,
  profile: LayoutProfile = "compact",
): number {
  if (au <= 0) {
    return 0;
  }
  if (profile === "proportional") {
    if (au <= PROPORTIONAL_OUTER_AU) {
      return PROPORTIONAL_BASE + au * PROPORTIONAL_AU_SCALE;
    }
    const innerEdge =
      PROPORTIONAL_BASE + PROPORTIONAL_OUTER_AU * PROPORTIONAL_AU_SCALE;
    return innerEdge + Math.log10(au / PROPORTIONAL_OUTER_AU) * PROPORTIONAL_LOG_SCALE;
  }
  return COMPACT_BASE + Math.pow(au, 0.5) * COMPACT_AU_SCALE;
}

export function visualLocalOrbit(localOrbit: number): number {
  if (localOrbit <= 0) {
    return 0;
  }
  return localOrbit * LOCAL_ORBIT_SCALE;
}

export function minBodyGap(profile: LayoutProfile): number {
  return profile === "proportional" ? 24 : 10;
}
