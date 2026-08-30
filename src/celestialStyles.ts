import type { ObjectType } from "./catalog";

export type CelestialStyle = {
  kind: "globe" | "asteroid" | "comet";
  base: string;
  accent: string;
  /** 0–360 hue tweak for asteroid rock sprite */
  rockHue?: number;
  /** Comet tail direction in degrees */
  tailAngle?: number;
  /** Haumea-style egg shape */
  stretch?: number;
};

export const CELESTIAL_STYLE: Record<string, CelestialStyle> = {
  ceres: { kind: "globe", base: "#b8b0a0", accent: "#f0f0e8" },
  pluto: { kind: "globe", base: "#c8b8a8", accent: "#e8d8c8" },
  eris: { kind: "globe", base: "#d8dce4", accent: "#f4f6ff" },
  haumea: { kind: "globe", base: "#ece8e0", accent: "#ffffff", stretch: 1.45 },
  makemake: { kind: "globe", base: "#c89870", accent: "#e8c8a0" },
  sedna: { kind: "globe", base: "#c87860", accent: "#ffb090" },
  quaoar: { kind: "globe", base: "#a87058", accent: "#d8a888" },
  orcus: { kind: "globe", base: "#909090", accent: "#c0c0c0" },
  gonggong: { kind: "globe", base: "#b86868", accent: "#e8a0a0" },
  varuna: { kind: "globe", base: "#887060", accent: "#c0a080" },
  ixion: { kind: "globe", base: "#907058", accent: "#c89878" },
  hygiea: { kind: "globe", base: "#a8a098", accent: "#d8d0c8" },
  vesta: { kind: "asteroid", base: "#e0d8c8", accent: "#ffffff", rockHue: 18 },
  pallas: { kind: "asteroid", base: "#b8b0a8", accent: "#e8e0d8", rockHue: 200 },
  psyche: { kind: "asteroid", base: "#c8a878", accent: "#ffe8c0", rockHue: 32 },
  bennu: { kind: "asteroid", base: "#a89080", accent: "#d8c0b0", rockHue: 12 },
  ryugu: { kind: "asteroid", base: "#908070", accent: "#c8b8a8", rockHue: 28 },
  ida: { kind: "asteroid", base: "#a89080", accent: "#d0c0b0", rockHue: 8 },
  gaspra: { kind: "asteroid", base: "#989088", accent: "#c8c0b8", rockHue: 180 },
  mathilde: { kind: "asteroid", base: "#686058", accent: "#989088", rockHue: 210 },
  eros: { kind: "asteroid", base: "#b0a090", accent: "#e0d0c0", rockHue: 24 },
  itokawa: { kind: "asteroid", base: "#a89888", accent: "#d8c8b8", rockHue: 36 },
  lutetia: { kind: "asteroid", base: "#908880", accent: "#c0b8b0", rockHue: 160 },
  halley: { kind: "comet", base: "#98d8ff", accent: "#e8f8ff", tailAngle: 210 },
  "hale-bopp": { kind: "comet", base: "#88c8f0", accent: "#d0f0ff", tailAngle: 160 },
  "67p": { kind: "comet", base: "#90c0e0", accent: "#d8eeff", tailAngle: 240 },
  "tempel-1": { kind: "comet", base: "#a0d0f0", accent: "#e0f4ff", tailAngle: 190 },
  "wild-2": { kind: "comet", base: "#98c8e8", accent: "#d8f0ff", tailAngle: 225 },
  "shoemaker-levy-9": {
    kind: "comet",
    base: "#88b8d8",
    accent: "#c8e8ff",
    tailAngle: 130,
  },
};

export function celestialStyleFor(id: string, type: ObjectType): CelestialStyle | null {
  if (CELESTIAL_STYLE[id]) {
    return CELESTIAL_STYLE[id]!;
  }
  if (type === "asteroid") {
    return { kind: "asteroid", base: "#a89888", accent: "#d8c8b8", rockHue: 0 };
  }
  if (type === "comet") {
    return { kind: "comet", base: "#98d0f0", accent: "#e0f4ff", tailAngle: 200 };
  }
  if (type === "dwarf-planet") {
    return { kind: "globe", base: "#b0a898", accent: "#e0d8d0" };
  }
  return null;
}
