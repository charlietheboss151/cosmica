import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import {
  applyClick,
  formatElapsed,
  startQuiz,
} from "./game";

const alwaysFirst = () => 0;

function planetCount() {
  return catalog.filter((object) => object.type === "planet").length;
}

describe("Seterra-style quiz", () => {
  it("asks the player to click a planet, never the Sun", () => {
    const quiz = startQuiz("planets", alwaysFirst, 0);
    expect(quiz.currentId).not.toBe("sun");
    expect(quiz.prompt).toMatch(/^Click on /);
    expect(quiz.placed).toBe(0);
    expect(quiz.total).toBe(planetCount());
    expect(quiz.mistakes).toBe(0);
  });

  it("moves to a new body after a correct click and never repeats", () => {
    let quiz = startQuiz("planets", () => 0.4, 1_000);
    const seen: string[] = [];
    while (quiz.currentId) {
      expect(seen).not.toContain(quiz.currentId);
      seen.push(quiz.currentId);
      quiz = applyClick(quiz, quiz.currentId, 1_000 + seen.length * 250);
    }
    expect(seen).toHaveLength(planetCount());
    expect(new Set(seen).size).toBe(planetCount());
    expect(quiz.placed).toBe(planetCount());
    expect(quiz.finishedAt).toBe(1_000 + planetCount() * 250);
    expect(quiz.mistakes).toBe(0);
  });

  it("counts a wrong click as a mistake and stays on the same body", () => {
    const quiz = startQuiz("planets", alwaysFirst, 0);
    const target = quiz.currentId!;
    const after = applyClick(quiz, target === "venus" ? "mars" : "venus", 500);
    expect(after.currentId).toBe(target);
    expect(after.mistakes).toBe(1);
    expect(after.placed).toBe(0);
    expect(after.lastResult).toBe("incorrect");
  });

  it("ignores clicks on bodies that are grayed out in this mode", () => {
    const quiz = startQuiz("planets", alwaysFirst, 0);
    const after = applyClick(quiz, "europa", 10);
    expect(after).toEqual(quiz);
  });

  it("asks the player to click a moon in Moons mode", () => {
    const quiz = startQuiz("moons", alwaysFirst, 0);
    expect(quiz.mode).toBe("moons");
    const target = catalog.find((object) => object.id === quiz.currentId);
    expect(target?.type).toBe("moon");
    expect(quiz.prompt.startsWith("Click on ")).toBe(true);
  });

  it("ignores planet clicks in Moons mode", () => {
    const quiz = startQuiz("moons", alwaysFirst, 0);
    const after = applyClick(quiz, "earth", 10);
    expect(after).toEqual(quiz);
  });

  it("formats the timer as m:ss", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(5_000)).toBe("0:05");
    expect(formatElapsed(65_000)).toBe("1:05");
  });

  it("marks a first-try find with green, then yellow, orange, and red", () => {
    const other = (id: string) => (id === "venus" ? "mars" : "venus");
    let quiz = startQuiz("planets", alwaysFirst, 0);
    const first = quiz.currentId!;
    quiz = applyClick(quiz, first, 1);
    expect(quiz.marks[first]).toBe("green");

    const second = quiz.currentId!;
    quiz = applyClick(quiz, other(second), 2);
    quiz = applyClick(quiz, second, 3);
    expect(quiz.marks[second]).toBe("yellow");

    const third = quiz.currentId!;
    quiz = applyClick(quiz, other(third), 4);
    quiz = applyClick(quiz, other(third), 5);
    quiz = applyClick(quiz, third, 6);
    expect(quiz.marks[third]).toBe("orange");

    const fourth = quiz.currentId!;
    quiz = applyClick(quiz, other(fourth), 7);
    quiz = applyClick(quiz, other(fourth), 8);
    quiz = applyClick(quiz, other(fourth), 9);
    quiz = applyClick(quiz, fourth, 10);
    expect(quiz.marks[fourth]).toBe("red");
  });

  it("flashes the wrong body without leaving a red ring", () => {
    const quiz = startQuiz("planets", alwaysFirst, 0);
    const target = quiz.currentId!;
    const wrong = target === "venus" ? "mars" : "venus";
    const after = applyClick(quiz, wrong, 1);
    expect(after.wrongFlashId).toBe(wrong);
    expect(after.marks[wrong]).toBeUndefined();
    expect(after.marks[target]).toBeUndefined();
  });
});
