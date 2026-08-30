import type { GameMode } from "./catalog";

export type LayoutProfile = "compact" | "proportional";

export function layoutProfileForMode(mode: GameMode): LayoutProfile {
  return mode === "celestial" ? "proportional" : "compact";
}

const PROPORTIONAL_BASE = 108;
const PROPORTIONAL_AU_SCALE = 54;
const PROPORTIONAL_OUTER_AU = 50;
const PROPORTIONAL_LOG_SCALE = 480;

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
  return 92 + Math.pow(au, 0.5) * 158;
}

export function minBodyGap(profile: LayoutProfile): number {
  return profile === "proportional" ? 20 : 12;
}
