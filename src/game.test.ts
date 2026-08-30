import { describe, expect, it } from "vitest";
import { applyClick, startRound } from "./game";

const alwaysFirst = () => 0;

describe("FIND round", () => {
  it("asks the player to find a planet, never the Sun", () => {
    const round = startRound(alwaysFirst);
    expect(round.prompt).toBe("FIND: MERCURY");
    expect(round.targetId).toBe("mercury");
    expect(round.score).toBe(0);
    expect(round.streak).toBe(0);
  });

  it("awards 100 XP and grows the streak on a correct click", () => {
    const after = applyClick(startRound(alwaysFirst), "mercury", alwaysFirst);
    expect(after.feedback).toBe("correct");
    expect(after.score).toBe(100);
    expect(after.streak).toBe(1);
    expect(after.targetId).not.toBe("mercury");
  });

  it("resets the streak when the wrong object is clicked", () => {
    const afterCorrect = applyClick(
      startRound(alwaysFirst),
      "mercury",
      alwaysFirst,
    );
    const afterWrong = applyClick(afterCorrect, "sun", alwaysFirst);
    expect(afterWrong.feedback).toBe("incorrect");
    expect(afterWrong.score).toBe(100);
    expect(afterWrong.streak).toBe(0);
    expect(afterWrong.targetId).toBe(afterCorrect.targetId);
  });
});
