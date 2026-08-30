import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BODY_ART, MOON_ART_IDS } from "./bodyArtAssets";
import { BodyArt } from "./BodyArt";

describe("cartoon body art", () => {
  it("has NASA photos for every moon in the catalog", () => {
    expect(MOON_ART_IDS.length).toBe(35);
    for (const id of MOON_ART_IDS) {
      expect(BODY_ART[id]).toBe(`/bodies/${id}.png`);
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
    ]) {
      expect(BODY_ART[id]).toBe(`/bodies/${id}.png`);
    }
  });

  it("draws Earth from its cartoon sticker, not a flat blue disc", () => {
    const { container } = render(
      <svg>
        <BodyArt id="earth" radius={40} color="#4ea3ff" />
      </svg>,
    );
    const image = container.querySelector("image");
    expect(image).toHaveAttribute("href", "/bodies/earth.png");
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
      "/bodies/saturn.png",
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
      "/bodies/europa.png",
    );
    expect(container.querySelector("circle.disc")).toBeNull();

    const charon = render(
      <svg>
        <BodyArt id="charon" radius={10} color="#c9ddd8" />
      </svg>,
    );
    expect(charon.container.querySelector("image")).toHaveAttribute(
      "href",
      "/bodies/charon.png",
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
    expect(container.querySelector("image")).toHaveAttribute("href", "/bodies/ceres.png");
    expect(container.querySelector(".celestial-globe")).toBeNull();
  });

  it("draws hard-mode dwarf planets with textured globe fallbacks", () => {
    const { container } = render(
      <svg>
        <BodyArt id="orcus" radius={10} color="#909090" type="dwarf-planet" />
      </svg>,
    );
    expect(container.querySelector(".celestial-globe")).not.toBeNull();
    expect(container.querySelectorAll(".globe-crater").length).toBeGreaterThan(0);
  });

  it("draws comets with a tail and asteroids with rock sprites", () => {
    const comet = render(
      <svg>
        <BodyArt id="halley" radius={10} color="#c8e8ff" type="comet" />
      </svg>,
    );
    expect(comet.container.querySelector("image")).toHaveAttribute("href", "/bodies/halley.png");

    const asteroid = render(
      <svg>
        <BodyArt id="vesta" radius={10} color="#d8d0c0" type="asteroid" />
      </svg>,
    );
    expect(asteroid.container.querySelector("image")).toHaveAttribute("href", "/bodies/vesta.png");
  });
});
