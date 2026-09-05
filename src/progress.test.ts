import { describe, expect, it } from "vitest";
import {
  applyRound,
  emptyProgress,
  formatBest,
  loadProgress,
  parseProgress,
  PROGRESS_KEY,
  rankFromXp,
  saveProgress,
  XP_PER_LEVEL,
} from "./progress";

function memoryStore(seed: Record<string, string> = {}) {
  const data = { ...seed };
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

describe("player progress", () => {
  it("starts empty and ranks Cadet at level 1", () => {
    const rank = rankFromXp(0);
    expect(rank.level).toBe(1);
    expect(rank.title).toBe("Cadet");
    expect(rank.percent).toBe(0);
  });

  it("levels up every XP_PER_LEVEL points", () => {
    expect(rankFromXp(XP_PER_LEVEL).level).toBe(2);
    expect(rankFromXp(XP_PER_LEVEL * 6).title).toBe("Space Explorer");
  });

  it("records unique finds, XP, and a faster full-set best time", () => {
    const first = applyRound(emptyProgress(), {
      mode: "planets",
      foundIds: ["mercury", "venus"],
      elapsedMs: 80_000,
      score: 6,
      fullSet: true,
    });
    expect(first.xp).toBe(6);
    expect(first.bestMs.planets).toBe(80_000);
    const second = applyRound(first, {
      mode: "planets",
      foundIds: ["venus", "earth"],
      elapsedMs: 50_000,
      score: 3,
      fullSet: true,
    });
    expect(second.found.planets.sort()).toEqual(["earth", "mercury", "venus"]);
    expect(second.xp).toBe(9);
    expect(second.bestMs.planets).toBe(50_000);
    expect(formatBest(second.bestMs.planets)).toBe("50.0s");
    expect(formatBest(94_000)).toBe("1:34");
  });

  it("does not use a subset round as the mode best", () => {
    const after = applyRound(emptyProgress(), {
      mode: "moons",
      foundIds: ["phobos"],
      elapsedMs: 4_000,
      score: 3,
      fullSet: false,
    });
    expect(after.bestMs.moons).toBeNull();
    expect(after.found.moons).toEqual(["phobos"]);
  });

  it("round-trips through storage", () => {
    const store = memoryStore();
    const saved = applyRound(emptyProgress(), {
      mode: "celestial",
      foundIds: ["pluto"],
      elapsedMs: 12_000,
      score: 3,
      fullSet: true,
    });
    saveProgress(saved, store);
    expect(store.getItem(PROGRESS_KEY)).toContain("pluto");
    expect(loadProgress(store).found.celestial).toEqual(["pluto"]);
  });

  it("ignores junk stored JSON", () => {
    expect(parseProgress(null).xp).toBe(0);
    expect(parseProgress({ xp: -9, found: { planets: [1] } }).found.planets).toEqual(
      [],
    );
  });
});
