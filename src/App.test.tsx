import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App, { FEEDBACK_CLEAR_MS } from "./App";
import { publicUrl } from "./publicUrl";

async function openMenu() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Play" }));
  return user;
}

describe("Cosmica prototype", () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("shows the home page with logo and creator credit", () => {
    render(<App />);
    expect(screen.getByRole("img", { name: /Cosmica\. Explore the Solar System/i })).toHaveAttribute(
      "src",
      publicUrl("cosmica-logo.png"),
    );
    expect(screen.getByText(/Explore the Solar System\. Master the cosmos/i)).toBeInTheDocument();
    expect(document.querySelector(".home-backdrop")).not.toBeNull();
    expect(screen.getByText(/Designed & created by/i)).toBeInTheDocument();
    expect(screen.getByText("Charlie Bishop")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.queryByText(/solar system map quiz/i)).not.toBeInTheDocument();
  });

  it("lets the player pick Planets mode from the menu", async () => {
    const user = await openMenu();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What will you explore?" })).toBeInTheDocument();
    expect(screen.getByText(/Choose your mission/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quick Play" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Planets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Planets" }).querySelector("img")).toHaveAttribute(
      "src",
      publicUrl("bodies/earth.png"),
    );
    expect(screen.getByRole("button", { name: "Moons" }).querySelector("img")).toHaveAttribute(
      "src",
      publicUrl("bodies/moon.png"),
    );
    expect(screen.getByRole("button", { name: "Celestial bodies" }).querySelector("svg")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Spacecraft, coming soon/i })).toBeDisabled();
    expect(screen.getByTestId("progress-planets")).toHaveTextContent("Planets 0/");
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(screen.getByTestId("find-prompt")).toBeInTheDocument();
  });

  it("returns to the title screen from the mission menu", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText(/Explore the Solar System\. Master the cosmos/i)).toBeInTheDocument();
  });

  it("starts a random round from Quick Play", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Quick Play" }));
    expect(screen.getByTestId("find-prompt")).toBeInTheDocument();
  });

  it("starts a FIND round on the full map with only planets lit", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
    expect(screen.getByRole("button", { name: "Mercury" })).toBeEnabled();
    expect(document.querySelectorAll("text.label")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Europa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Asteroid Belt" })).not.toBeInTheDocument();
  });

  it("opens a Moons setup screen from the menu", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Moons" }));
    expect(screen.getByRole("heading", { name: "Moons" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All planet moons" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Mars" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("starts a FIND round with moons lit and planets grayed", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "All planet moons" }));
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
    const target = (screen.getByTestId("find-prompt").textContent ?? "").replace(
      "Click on ",
      "",
    );
    expect(screen.getByRole("button", { name: target })).toBeEnabled();
    expect(document.querySelectorAll(".body-moon.body-lit").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Mercury" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("shows tiny decorative moons in Planets mode without making them clickable", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(screen.queryByRole("button", { name: "Europa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Moon" })).not.toBeInTheDocument();
    expect(document.querySelectorAll(".body-moon-decor").length).toBeGreaterThan(0);
    expect(screen.getByTestId("score")).toHaveTextContent("0 / 8");
    expect(screen.getByTestId("timer")).toHaveTextContent(/^\d+:\d{2}$/);
  });

  it("starts Celestial bodies mode from the menu", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Celestial bodies" }));
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
    expect(screen.getByRole("button", { name: "Mercury" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.queryByRole("button", { name: "Europa" })).not.toBeInTheDocument();
    expect(document.querySelector(".body-moon.body-dim")).not.toBeNull();
    expect(document.querySelector(".body-moon-decor")).toBeNull();
  });

  it("lets players click dwarf planets in Celestial mode without belt regions", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Celestial bodies" }));
    const pluto = screen.getByRole("button", { name: "Pluto" });
    expect(pluto).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("button", { name: "Asteroid Belt" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kuiper Belt" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scattered Disc" })).toBeInTheDocument();
  });

  it("draws planet orbit guides in Moons mode", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(document.querySelectorAll("circle.orbit").length).toBe(8);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "All planet moons" }));
    const heliocentric = [...document.querySelectorAll("circle.orbit")].filter(
      (node) => !node.classList.contains("orbit-local"),
    );
    expect(heliocentric.length).toBe(0);
    expect(document.querySelectorAll("circle.orbit-local").length).toBeGreaterThan(0);
  });

  it("lets players choose planets and quiz only those moons", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "Mars" }));
    await user.click(screen.getByRole("button", { name: "Play selected (2 moons)" }));
    expect(screen.getByTestId("score")).toHaveTextContent("0 / 2");
    expect(screen.getByRole("button", { name: "Phobos" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Europa" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: "Mercury" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("shows the clicked planet name after a wrong click", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const target = prompt.replace("Click on ", "");
    const decoy = target === "Venus" ? "Mars" : "Venus";
    await user.click(screen.getByRole("button", { name: decoy }));
    expect(screen.getByTestId("feedback")).toHaveTextContent(decoy);
    expect(document.querySelector(".try-ring-flash")).not.toBeNull();
    expect(document.querySelector(".try-ring-red")).toBeNull();
  });

  it("scores a correct planet click and keeps the map as the answer", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const name = prompt.replace("Click on ", "");
    await user.click(screen.getByRole("button", { name: name }));
    expect(screen.getByTestId("score")).toHaveTextContent("1 / 8");
    expect(screen.getByTestId("streak")).toHaveTextContent("Streak 1");
    expect(screen.getByTestId("find-prompt").textContent).not.toBe(prompt);
    expect(document.querySelector(".try-ring-green")).not.toBeNull();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("clears CORRECT feedback after a short delay", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const name = prompt.replace("Click on ", "");
    fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.getByTestId("feedback")).toHaveTextContent("CORRECT");

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_CLEAR_MS - 1);
    });
    expect(screen.getByTestId("feedback")).toHaveTextContent("CORRECT");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByTestId("feedback")).not.toBeInTheDocument();
  });

  it("clears miss feedback after the same short delay", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const target = prompt.replace("Click on ", "");
    const decoy = target === "Venus" ? "Mars" : "Venus";
    fireEvent.click(screen.getByRole("button", { name: decoy }));
    expect(screen.getByTestId("feedback")).toHaveTextContent(decoy);

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_CLEAR_MS);
    });
    expect(screen.queryByTestId("feedback")).not.toBeInTheDocument();
  });

  it("wires obscure moons hard mode into a Moons round", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "Include obscure moons" }));
    await user.click(screen.getByRole("button", { name: "All planet moons" }));
    const score = screen.getByTestId("score").textContent ?? "";
    const total = Number(score.split("/")[1]?.trim());
    expect(total).toBeGreaterThan(20);
    expect(screen.getByRole("button", { name: "Charon" })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("keeps hard-only moons disabled until hard mode is on", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "All planet moons" }));
    expect(screen.getByRole("button", { name: "Charon" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("finishes a Planets round, shows results, and can replay", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    for (let placed = 0; placed < 8; placed += 1) {
      const prompt = screen.getByTestId("find-prompt").textContent ?? "";
      const name = prompt.replace("Click on ", "");
      await user.click(screen.getByRole("button", { name }));
    }
    expect(screen.getByRole("dialog", { name: "Round complete" })).toBeInTheDocument();
    expect(screen.getByTestId("results-score")).toHaveTextContent("8 / 8");
    expect(screen.getByTestId("results-found")).toHaveTextContent("8 / 8");
    expect(screen.getByTestId("results-correct")).toHaveTextContent("8");
    expect(screen.getByTestId("results-incorrect")).toHaveTextContent("0");
    expect(screen.getByTestId("results-accuracy")).toHaveTextContent("100%");
    expect(screen.getByTestId("results-streak")).toHaveTextContent("8");
    await user.click(screen.getByRole("button", { name: "Play again" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("score")).toHaveTextContent("0 / 8");
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
  });

  it("records finds, XP, and a best time on the menu after a round", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    for (let placed = 0; placed < 8; placed += 1) {
      const prompt = screen.getByTestId("find-prompt").textContent ?? "";
      const name = prompt.replace("Click on ", "");
      await user.click(screen.getByRole("button", { name }));
    }
    const dialog = screen.getByRole("dialog", { name: "Round complete" });
    await user.click(within(dialog).getByRole("button", { name: "Menu" }));
    expect(screen.getByTestId("progress-planets")).toHaveTextContent("Planets 8/8");
    expect(screen.getByText(/Level 1 — Cadet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Planets" })).toHaveTextContent(/BEST • \d/);
  });

  it("activates a quiz body with the keyboard", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const name = prompt.replace("Click on ", "");
    const target = screen.getByRole("button", { name });
    target.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("score")).toHaveTextContent("1 / 8");
  });
});
