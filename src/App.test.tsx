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

  it("opens a Moons setup screen from the menu", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Moons" }));
    expect(screen.getByRole("heading", { name: "Moons" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All planet moons" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Mars" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("starts a FIND round with moons lit and planets grayed", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "All planet moons" }));
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^Click on /);
    const target = (screen.getByTestId("find-prompt").textContent ?? "").replace(
      "Click on ",
      "",
    );
    expect(screen.getByRole("button", { name: target })).toBeEnabled();
    expect(document.querySelectorAll(".body-moon.body-lit").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Mercury" })).not.toBeInTheDocument();
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

  it("draws planet orbit guides in Moons mode", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(document.querySelectorAll(".belt-orbit").length).toBe(0);
    expect(document.querySelectorAll("circle.orbit").length).toBe(8);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "All planet moons" }));
    const heliocentric = [...document.querySelectorAll("circle.orbit")].filter(
      (node) => !node.classList.contains("orbit-local"),
    );
    expect(heliocentric.length).toBe(1);
    expect(document.querySelectorAll("circle.orbit-local").length).toBeGreaterThan(0);
  });

  it("lets players choose planets and quiz only those moons", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Moons" }));
    await user.click(screen.getByRole("button", { name: "Mars" }));
    await user.click(screen.getByRole("button", { name: "Play selected (2 moons)" }));
    expect(screen.getByTestId("score")).toHaveTextContent("0 / 2");
    expect(screen.getByRole("button", { name: "Phobos" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Europa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mercury" })).not.toBeInTheDocument();
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
});
