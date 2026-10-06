import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initI18n } from "@/i18n";
import { useJourneyStore } from "@/store/journeyStore";
import Tawaf from "./Tawaf";

vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
initI18n("en");

const renderTawaf = () =>
  render(
    <MemoryRouter>
      <Tawaf />
    </MemoryRouter>,
  );

beforeEach(() => {
  act(() => useJourneyStore.setState({ journey: null, hydrated: true }));
});

describe("Tawaf screen", () => {
  it("requires confirmation before completing a circuit, then allows undo", async () => {
    const user = userEvent.setup();
    act(() => void useJourneyStore.getState().tawaf("START"));
    renderTawaf();
    expect(screen.getByTestId("tawaf-counter")).toHaveTextContent("1 / 7");

    await user.click(screen.getByRole("button", { name: "Complete Circuit 1" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(useJourneyStore.getState().journey?.tawaf).toBe("ROUND_1");

    await user.click(screen.getByRole("button", { name: "Complete Circuit 1" }));
    await user.click(screen.getByRole("button", { name: "Yes, completed" }));
    expect(screen.getByTestId("tawaf-counter")).toHaveTextContent("2 / 7");
    expect(screen.getByTestId("tawaf-completed")).toHaveTextContent("1 of 7 circuits completed");

    await user.click(screen.getAllByRole("button", { name: "Undo last circuit" })[0]!);
    expect(useJourneyStore.getState().journey?.tawaf).toBe("ROUND_1");
  });

  it("shows brisk-walking guidance for circuits 1–3 and normal walking from circuit 4", async () => {
    act(() => {
      useJourneyStore.getState().tawaf("START");
      for (let i = 0; i < 2; i++) useJourneyStore.getState().tawaf("COMPLETE_ROUND");
    });
    renderTawaf();
    expect(screen.getByTestId("instruction-tawaf.walking.circuits_1_3")).toBeInTheDocument();
    act(() => void useJourneyStore.getState().tawaf("COMPLETE_ROUND"));
    expect(screen.getByTestId("instruction-tawaf.walking.circuits_4_7")).toBeInTheDocument();
  });

  it("resets only after confirmation", async () => {
    const user = userEvent.setup();
    act(() => {
      useJourneyStore.getState().tawaf("START");
      useJourneyStore.getState().tawaf("COMPLETE_ROUND");
    });
    renderTawaf();
    await user.click(screen.getByRole("button", { name: "Reset Tawaf" }));
    expect(useJourneyStore.getState().journey?.tawaf).toBe("ROUND_2");
    const dialogButtons = screen.getAllByRole("button", { name: "Reset Tawaf" });
    await user.click(dialogButtons[dialogButtons.length - 1]!);
    expect(useJourneyStore.getState().journey?.tawaf).toBe("NOT_STARTED");
  });
});
