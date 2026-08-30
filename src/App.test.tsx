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
    expect(screen.getByRole("button", { name: "Asteroid Belt" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
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

  it("does not show moons to click in Planets mode", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    expect(screen.queryByRole("button", { name: "Europa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Moon" })).not.toBeInTheDocument();
    expect(screen.getByTestId("score")).toHaveTextContent("0 / 8");
    expect(screen.getByTestId("timer")).toHaveTextContent(/^\d+:\d{2}$/);
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
