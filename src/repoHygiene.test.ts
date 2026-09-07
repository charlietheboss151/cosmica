import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("repo hygiene", () => {
  it("does not keep unused Vite scaffold or duplicate body assets", () => {
    const absent = [
      "src/assets/hero.png",
      "src/assets/react.svg",
      "src/assets/vite.svg",
      "public/icons.svg",
      "public/bodies/asteroid-rock.svg",
      "vitest.config.ts",
    ];
    for (const relative of absent) {
      expect(existsSync(path.join(root, relative)), relative).toBe(false);
    }
  });

  it("uses a dedicated favicon instead of the full Cosmica logo", () => {
    const html = readFileSync(path.join(root, "index.html"), "utf8");
    expect(html).toMatch(/rel="icon"[^>]+href="\/favicon\.svg"/);
    expect(html).not.toMatch(/rel="icon"[^>]+cosmica-logo\.png/);
    const svg = readFileSync(path.join(root, "public/favicon.svg"), "utf8");
    expect(svg).not.toMatch(/#863bff/);
    expect(existsSync(path.join(root, "public/apple-touch-icon.png"))).toBe(true);
  });

  it("compiles the app with full TypeScript strictness", () => {
    const config = readFileSync(path.join(root, "tsconfig.app.json"), "utf8");
    expect(config).toMatch(/"strict":\s*true/);
    expect(config).toMatch(/"noUncheckedIndexedAccess":\s*true/);
  });
});
