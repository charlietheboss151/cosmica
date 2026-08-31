import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowPath = path.join(root, ".github", "workflows", "ci.yml");

describe("CI workflow", () => {
  it("defines a GitHub Actions job that runs lint, test, and build", () => {
    expect(existsSync(workflowPath)).toBe(true);
    const yaml = readFileSync(workflowPath, "utf8");
    expect(yaml).toMatch(/npm ci/);
    expect(yaml).toMatch(/npm run lint/);
    expect(yaml).toMatch(/npm test/);
    expect(yaml).toMatch(/npm run build/);
    expect(yaml).toMatch(/ubuntu-latest/);
    expect(yaml).toMatch(/node-version:\s*["']?22/);
  });
});
