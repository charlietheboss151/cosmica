import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OrbitBackdrop from "./OrbitBackdrop";

describe("home orbit backdrop", () => {
  it("clips planet stickers to a circle so square art backgrounds do not show as boxes", () => {
    const { container } = render(<OrbitBackdrop speed={5} className="orbit-backdrop-home" />);
    const earth = container.querySelector('image[clip-path="url(#orbit-clip-earth)"]');
    expect(earth).not.toBeNull();
    const clip = container.querySelector("#orbit-clip-earth circle");
    expect(clip).not.toBeNull();
    const boxed = [...container.querySelectorAll("image")].filter(
      (node) => !node.getAttribute("clip-path"),
    );
    expect(boxed).toEqual([]);
  });
});
