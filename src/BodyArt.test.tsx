import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BODY_ART } from "./bodyArtAssets";
import { BodyArt } from "./BodyArt";

describe("cartoon body art", () => {
  it("has a drawing for the Sun and every planet", () => {
    expect(Object.keys(BODY_ART).sort()).toEqual([
      "earth",
      "jupiter",
      "mars",
      "mercury",
      "neptune",
      "saturn",
      "sun",
      "uranus",
      "venus",
    ]);
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

  it("falls back to a simple disc for moons", () => {
    const { container } = render(
      <svg>
        <BodyArt id="europa" radius={10} color="#c9ddd8" />
      </svg>,
    );
    expect(container.querySelector("image")).toBeNull();
    expect(container.querySelector("circle.disc")).not.toBeNull();
  });
});
