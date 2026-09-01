import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

vi.mock("./BodyArt", () => ({
  BodyArt: vi.fn(() => null),
}));

import { BodyArt } from "./BodyArt";
import { catalog } from "./catalog";
import SolarSystemMap from "./SolarSystemMap";

describe("SolarSystemMap orbit performance", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 800,
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 600,
    });
    vi.mocked(BodyArt).mockClear();
  });

  it("does not re-render body art on every animation frame while orbiting", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    render(
      <SolarSystemMap
        objects={catalog}
        mode="planets"
        orbitStartMs={1_000_000}
        onSelect={vi.fn()}
      />,
    );

    const rendersAfterMount = vi.mocked(BodyArt).mock.calls.length;
    expect(rendersAfterMount).toBeGreaterThan(0);

    act(() => {
      for (let i = 0; i < 8; i += 1) {
        const cb = frames.shift();
        expect(cb).toBeTypeOf("function");
        cb?.(1_000_000 + i * 16);
      }
    });

    expect(vi.mocked(BodyArt).mock.calls.length).toBe(rendersAfterMount);
    vi.unstubAllGlobals();
  });
});
