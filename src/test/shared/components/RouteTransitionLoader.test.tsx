import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { RouteTransitionLoader } from "@/shared/components/RouteTransitionLoader";

vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: ({ label }: { label: string }) => <div>{label}</div>,
}));

describe("RouteTransitionLoader", () => {
  it("renders loading status and loader", async () => {
    function TestNavigator() {
      const navigate = useNavigate();
      return (
        <button
          onClick={() => {
            navigate("/map");
          }}
          type="button"
        >
          Go
        </button>
      );
    }

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <RouteTransitionLoader />
        <TestNavigator />
      </MemoryRouter>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Go" }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("status", { name: "Loading screen" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Loading screen")).toBeInTheDocument();
  });
});
