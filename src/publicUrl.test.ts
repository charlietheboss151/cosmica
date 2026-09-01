import { describe, expect, it } from "vitest";
import { publicUrl } from "./publicUrl";

describe("publicUrl", () => {
  it("prefixes public asset paths with the Vite base URL", () => {
    const base = import.meta.env.BASE_URL;
    expect(publicUrl("cosmica-logo.png")).toBe(`${base}cosmica-logo.png`);
    expect(publicUrl("/bodies/earth.png")).toBe(`${base}bodies/earth.png`);
  });
});
