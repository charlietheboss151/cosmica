import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BODY_ART, MOON_ART_IDS, SPACECRAFT_ART_IDS } from "./bodyArtAssets";
import { BodyArt } from "./BodyArt";
import { publicUrl } from "./publicUrl";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const oxlintBin = path.join(repoRoot, "node_modules", ".bin", "oxlint");

describe("cartoon body art", () => {
  it("has NASA photos for every moon in the catalog", () => {
    expect(MOON_ART_IDS.length).toBe(35);
    for (const id of MOON_ART_IDS) {
      expect(BODY_ART[id]).toBe(publicUrl(`bodies/${id}.png`));
    }
  });

  it("has art assets for the Sun, planets, and celestial bodies", () => {
    for (const id of [
      "sun",
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
      "pluto",
      "ceres",
      "vesta",
      "halley",
      "haumea",
      "hygiea",
      "gonggong",
      "ixion",
      "orcus",
      "varuna",
    ]) {
      expect(BODY_ART[id]).toBe(publicUrl(`bodies/${id}.png`));
    }
  });

  it("draws Earth from its cartoon sticker, not a flat blue disc", () => {
    const { container } = render(
      <svg>
        <BodyArt id="earth" radius={40} color="#4ea3ff" />
      </svg>,
    );
    const image = container.querySelector("image");
    expect(image).toHaveAttribute("href", publicUrl("bodies/earth.png"));
  });

  it("draws Saturn with a ring behind the globe and a ring in front", () => {
    const { container } = render(
      <svg>
        <BodyArt id="saturn" radius={40} color="#f0d48a" />
      </svg>,
    );
    const back = container.querySelector(".saturn-ring-back");
    const front = container.querySelector(".saturn-ring-front");
    expect(back?.tagName.toLowerCase()).toBe("path");
    expect(front?.tagName.toLowerCase()).toBe("path");
    expect(back).toHaveAttribute("fill-rule", "evenodd");
    expect(back?.getAttribute("d")?.match(/A /g)?.length).toBe(4);
    expect(front?.getAttribute("d")?.match(/A /g)?.length).toBe(2);
    expect(front?.getAttribute("d")).toMatch(/0 0 0 /);
    expect(front?.getAttribute("d")).toMatch(/0 0 1 /);
    expect(container.querySelector("image")).toHaveAttribute(
      "href",
      publicUrl("bodies/saturn.png"),
    );
    const inner = Number(back?.getAttribute("data-inner-rx"));
    const outer = Number(back?.getAttribute("data-outer-rx"));
    expect(inner).toBeGreaterThan(40);
    expect(inner).toBeLessThan(40 * 1.35);
    expect(outer).toBeGreaterThan(inner);
  });

  it("draws moons from NASA photos instead of flat discs", () => {
    const { container } = render(
      <svg>
        <BodyArt id="europa" radius={10} color="#c9ddd8" />
      </svg>,
    );
    expect(container.querySelector("image")).toHaveAttribute(
      "href",
      publicUrl("bodies/europa.png"),
    );
    expect(container.querySelector("circle.disc")).toBeNull();

    const charon = render(
      <svg>
        <BodyArt id="charon" radius={10} color="#c9ddd8" />
      </svg>,
    );
    expect(charon.container.querySelector("image")).toHaveAttribute(
      "href",
      publicUrl("bodies/charon.png"),
    );
  });

  it("falls back to a simple disc for bodies without art", () => {
    const { container } = render(
      <svg>
        <BodyArt id="unknown-body" radius={10} color="#3d6fff" type="planet" />
      </svg>,
    );
    expect(container.querySelector("image")).toBeNull();
    expect(container.querySelector("circle.disc")).not.toBeNull();
  });

  it("draws dwarf planets from NASA photos when available", () => {
    const { container } = render(
      <svg>
        <BodyArt id="ceres" radius={10} color="#9a9a9a" type="dwarf-planet" />
      </svg>,
    );
    expect(container.querySelector("image")).toHaveAttribute("href", publicUrl("bodies/ceres.png"));
    expect(container.querySelector(".celestial-globe")).toBeNull();
  });

  it("draws hard-mode dwarf planets from art when available", () => {
    const { container } = render(
      <svg>
        <BodyArt id="orcus" radius={10} color="#909090" type="dwarf-planet" />
      </svg>,
    );
    expect(container.querySelector("image")).toHaveAttribute("href", publicUrl("bodies/orcus.png"));
    expect(container.querySelector(".celestial-globe")).toBeNull();
  });

  it("draws comets with a tail and asteroids with rock sprites", () => {
    const comet = render(
      <svg>
        <BodyArt id="halley" radius={10} color="#c8e8ff" type="comet" />
      </svg>,
    );
    expect(comet.container.querySelector("image")).toHaveAttribute("href", publicUrl("bodies/halley.png"));

    const asteroid = render(
      <svg>
        <BodyArt id="vesta" radius={10} color="#d8d0c0" type="asteroid" />
      </svg>,
    );
    expect(asteroid.container.querySelector("image")).toHaveAttribute("href", publicUrl("bodies/vesta.png"));
  });

  it("has photos for every spacecraft in the catalog", () => {
    expect(SPACECRAFT_ART_IDS.length).toBeGreaterThan(20);
    for (const id of SPACECRAFT_ART_IDS) {
      if (id === "solar-orbiter" || id === "hope") {
        expect(BODY_ART[id]).toBeUndefined();
        continue;
      }
      expect(BODY_ART[id]).toBe(publicUrl(`bodies/${id}.png`));
      expect(fs.existsSync(path.join(repoRoot, "public", "bodies", `${id}.png`))).toBe(true);
    }
  });

  it("cuts spacecraft photos out of their square backgrounds", () => {
    expect(() =>
      execFileSync("python", ["scripts/assert-spacecraft-cutouts.py"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    ).not.toThrow();
  });

  it("draws Solar Orbiter as a probe, not a square sun photo", () => {
    const { container } = render(
      <svg>
        <BodyArt id="solar-orbiter" radius={16} color="#e8b060" type="spacecraft" />
      </svg>,
    );
    expect(container.querySelector("image")).toBeNull();
    expect(container.querySelector('[data-testid="art-solar-orbiter"]')).not.toBeNull();
  });

  it("draws Hope as a probe, not a museum hall photo", () => {
    const { container } = render(
      <svg>
        <BodyArt id="hope" radius={16} color="#f0c070" type="spacecraft" />
      </svg>,
    );
    expect(container.querySelector("image")).toBeNull();
    expect(container.querySelector('[data-testid="art-hope"]')).not.toBeNull();
  });

  it("draws spacecraft from photos, not planet stickers or cartoon probes", () => {
    const { container } = render(
      <svg>
        <BodyArt id="voyager-1" radius={16} color="#ffd36a" type="spacecraft" />
      </svg>,
    );
    expect(container.querySelector(".spacecraft-art")).not.toBeNull();
    expect(container.querySelector('[data-testid="art-voyager-1"]')).not.toBeNull();
    expect(container.querySelector("image")).toHaveAttribute("href", publicUrl("bodies/voyager-1.png"));
    expect(container.querySelector("circle.disc")).toBeNull();
  });

  it("keeps useId unconditional so oxlint rules-of-hooks passes", () => {
    expect(() =>
      execFileSync(oxlintBin, ["src/BodyArt.tsx"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    ).not.toThrow();
  });
});
