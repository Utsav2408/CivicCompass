import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScreenErrorBoundary } from "@/shared/components/ScreenErrorBoundary";

function Crash() {
  throw new Error("boom");
  return null;
}

describe("ScreenErrorBoundary", () => {
  it("renders fallback UI when child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ScreenErrorBoundary>
        <Crash />
      </ScreenErrorBoundary>,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("reloads on retry button click", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ScreenErrorBoundary>
        <Crash />
      </ScreenErrorBoundary>,
    );
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: /retry/i })),
    ).not.toThrow();
    spy.mockRestore();
  });
});
