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

  it("draws Saturn with the full ring, not a sliced crop", () => {
    const { container } = render(
      <svg>
        <BodyArt id="saturn" radius={40} color="#f0d48a" />
      </svg>,
    );
    const image = container.querySelector("image");
    expect(image).toHaveAttribute("href", "/bodies/saturn.png");
    expect(image).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
    expect(container.querySelector("clipPath")).toBeNull();
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
