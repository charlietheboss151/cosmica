import type { SolarObject } from "./catalog";
import {
  applyOrbitPhase,
  layoutAll,
  type LayoutProfile,
} from "./layout";

/** Patch body and moon-orbit SVG nodes for the current orbit phase without React. */
export function syncOrbitDom(
  objects: SolarObject[],
  heliocentricPhaseDeg: number,
  moonPhaseDeg: number,
  profile: LayoutProfile,
  bodyElements: Map<string, SVGGElement | null>,
  moonOrbitElements: Map<string, SVGCircleElement | null>,
): void {
  const phased = applyOrbitPhase(objects, heliocentricPhaseDeg, moonPhaseDeg);
  const laid = layoutAll(phased, profile);
  for (const [id, element] of bodyElements) {
    if (!element) {
      continue;
    }
    const position = laid.get(id);
    if (position) {
      element.setAttribute("transform", `translate(${position.x} ${position.y})`);
    }
  }
  for (const object of phased) {
    if (object.type !== "moon") {
      continue;
    }
    const circle = moonOrbitElements.get(object.id);
    const parent = object.parentId ? laid.get(object.parentId) : undefined;
    if (!circle || !parent) {
      continue;
    }
    circle.setAttribute("cx", String(parent.x));
    circle.setAttribute("cy", String(parent.y));
  }
}
