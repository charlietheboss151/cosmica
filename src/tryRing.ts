import { screenPxToWorld } from "./camera";

const TRY_RING_GAP_PX = 6;

/** Sticker art is larger than the layout radius; rings must sit outside it. */
function artOverflowScale(id: string): number {
  if (id === "saturn") {
    return 2.2;
  }
  if (id === "sun") {
    return 1.34;
  }
  return 1.16;
}

export function tryRingRadius(id: string, radius: number, zoom: number): number {
  return radius * artOverflowScale(id) + screenPxToWorld(TRY_RING_GAP_PX, zoom);
}
