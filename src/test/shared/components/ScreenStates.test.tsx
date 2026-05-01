import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ScreenEmptyState,
  ScreenErrorState,
  ScreenLoadingState,
} from "@/shared/components/ScreenStates";

vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: ({ title, message }: { title: string; message: string }) => (
    <div>
      <div>{title}</div>
      <div>{message}</div>
    </div>
  ),
}));

describe("ScreenStates", () => {
  it("renders loading state with default and custom labels", () => {
    const { rerender } = render(<ScreenLoadingState />);
    expect(
      screen.getByRole("status", { name: "Loading..." }),
    ).toBeInTheDocument();
    rerender(<ScreenLoadingState label="Please wait" />);
    expect(
      screen.getByRole("status", { name: "Please wait" }),
    ).toBeInTheDocument();
  });

  it("uses custom retry handler when provided", () => {
    const onRetry = vi.fn();
    render(
      <ScreenErrorState message="Something went wrong" onRetry={onRetry} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("falls back to window reload when retry handler is absent", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload },
      configurable: true,
    });
    render(<ScreenErrorState message="Oops" retryLabel="Try again" />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalled();
  });

  it("renders empty state wrapper", () => {
    render(<ScreenEmptyState title="No data" message="Nothing to show" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
  });
});
