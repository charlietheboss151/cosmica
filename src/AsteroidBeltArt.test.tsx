import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AsteroidBeltArt } from "./AsteroidBeltArt";
import { publicUrl } from "./publicUrl";

describe("AsteroidBeltArt", () => {
  it("draws scattered cartoon rocks instead of a flat highlight ring", () => {
    const { container } = render(
      <svg>
        <AsteroidBeltArt inner={180} outer={220} label="Asteroid Belt" />
      </svg>,
    );
    expect(container.querySelector('[data-testid="asteroid-belt-art"]')).not.toBeNull();
    expect(container.querySelectorAll(".belt-rock, .belt-sprite").length).toBeGreaterThan(20);
    expect(container.querySelector(".belt-fill")).not.toBeNull();
    expect(container.querySelector(`image[href='${publicUrl("bodies/asteroid-rock.png")}']`)).not.toBeNull();
    expect(container.querySelector(".belt.belt-asteroid-belt")).toBeNull();
  });
});
