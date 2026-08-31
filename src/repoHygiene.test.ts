import { existsSync } from "node:fs";
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
});
