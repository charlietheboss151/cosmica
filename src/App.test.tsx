import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Cosmica prototype", () => {
  it("lets the player pick Planets mode from the menu", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "COSMICA" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Planets" }),
    ).toBeInTheDocument();
  });

  it("starts a FIND round on the full map with only planets lit", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
    expect(screen.getByRole("button", { name: "Mercury" })).toBeEnabled();
    expect(document.querySelectorAll("text.label")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Europa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Asteroid Belt" })).not.toBeInTheDocument();
  });

  it("lets the player pick Moons mode from the menu", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Moons" })).toBeEnabled();
  });

  it("starts a FIND round with moons lit and planets grayed", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Moons" }));
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
    expect(screen.getByRole("button", { name: "Europa" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Phobos" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Earth" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: "Mercury" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("shows tiny decorative moons in Planets mode without making them clickable", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(screen.queryByRole("button", { name: "Europa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Moon" })).not.toBeInTheDocument();
    expect(document.querySelectorAll(".body-moon-decor").length).toBeGreaterThan(0);
    expect(screen.getByTestId("score")).toHaveTextContent("0 / 8");
    expect(screen.getByTestId("timer")).toHaveTextContent(/^\d+:\d{2}$/);
  });

  it("starts Celestial bodies mode from the menu", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Celestial bodies" }));
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
    expect(screen.getByRole("button", { name: "Mercury" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("lets players click dwarf planets inside a belt region in Celestial mode", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Celestial bodies" }));
    const pluto = screen.getByRole("button", { name: "Pluto" });
    expect(pluto).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Kuiper Belt" })).toBeInTheDocument();
  });

  it("shows the clicked planet name after a wrong click", async () => {
    const user = userEvent.setup();
    render(<App />);
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
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const name = prompt.replace("Click on ", "");
    await user.click(screen.getByRole("button", { name }));
    expect(screen.getByTestId("score")).toHaveTextContent("1 / 8");
    expect(screen.getByTestId("find-prompt").textContent).not.toBe(prompt);
    expect(document.querySelector(".try-ring-green")).not.toBeNull();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("exposes prompt, score, and feedback updates to assistive tech", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(screen.getByTestId("find-prompt")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByTestId("score")).toHaveAttribute("aria-live", "polite");
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const target = prompt.replace("Click on ", "");
    const decoy = target === "Venus" ? "Mars" : "Venus";
    await user.click(screen.getByRole("button", { name: decoy }));
    expect(screen.getByTestId("feedback")).toHaveAttribute("aria-live", "assertive");
  });

  it("marks the results dialog as modal and moves focus into it", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    for (let placed = 0; placed < 8; placed += 1) {
      const prompt = screen.getByTestId("find-prompt").textContent ?? "";
      const name = prompt.replace("Click on ", "");
      await user.click(screen.getByRole("button", { name }));
    }
    const dialog = screen.getByRole("dialog", { name: "Round complete" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: "Play again" })).toHaveFocus();
  });
});
