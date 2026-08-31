import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import type { TryMark } from "./game";
import SolarSystemMap from "./SolarSystemMap";

type MarksProp = NonNullable<ComponentProps<typeof SolarSystemMap>["marks"]>;

/** Compile-time check: marks values must be TryMark, not arbitrary strings. */
const marksPropIsTryMarkRecord: MarksProp extends Record<string, TryMark>
  ? Record<string, TryMark> extends MarksProp
    ? true
    : never
  : never = true;

describe("SolarSystemMap marks typing", () => {
  it("types marks as Record<string, TryMark>", () => {
    expect(marksPropIsTryMarkRecord).toBe(true);
  });
});
