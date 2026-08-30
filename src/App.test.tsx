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
    expect(screen.getByTestId("find-prompt").textContent).toMatch(/^FIND: /);
    expect(screen.getByRole("button", { name: "Mercury" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Europa" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: "Asteroid Belt" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("does not score a grayed-out moon in Planets mode", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent;
    await user.click(screen.getByRole("button", { name: "Europa" }));
    expect(screen.getByTestId("find-prompt").textContent).toBe(prompt);
    expect(screen.getByTestId("score")).toHaveTextContent("0");
  });

  it("scores a correct planet click and keeps the map as the answer", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Planets" }));
    const prompt = screen.getByTestId("find-prompt").textContent ?? "";
    const target = prompt.replace("FIND: ", "");
    const name =
      target.charAt(0) + target.slice(1).toLowerCase();
    await user.click(screen.getByRole("button", { name }));
    expect(screen.getByTestId("score")).toHaveTextContent("100");
    expect(screen.getByTestId("streak")).toHaveTextContent("1");
    expect(screen.getByTestId("feedback")).toHaveTextContent("CORRECT");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});
