import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PoliceStationMarker } from "@/features/map/components/PoliceStationMarker";

vi.mock("@vis.gl/react-google-maps", () => ({
  AdvancedMarker: ({
    children,
    onClick,
    title,
  }: {
    children: ReactNode;
    onClick: () => void;
    title: string;
  }) => (
    <button type="button" data-testid="ps-marker" onClick={onClick} title={title}>
      {children}
    </button>
  ),
  InfoWindow: ({
    children,
    onCloseClick,
  }: {
    children: ReactNode;
    onCloseClick: () => void;
  }) => (
    <div>
      <button type="button" onClick={onCloseClick}>
        close
      </button>
      {children}
    </div>
  ),
  useAdvancedMarkerRef: () => [vi.fn(), { id: "anchor" }],
}));

describe("PoliceStationMarker", () => {
  it("opens and closes info window on marker click", () => {
    render(
      <PoliceStationMarker
        station={{
          id: "s1",
          name: "Connaught Place PS",
          address: "A",
          city: "Delhi",
          state: "Delhi",
          latitude: 28.6,
          longitude: 77.2,
          phone: "100",
        }}
      />,
    );

    expect(screen.queryByText("Connaught Place PS")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("ps-marker"));
    expect(screen.getByText("Connaught Place PS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /100/ })).toHaveAttribute(
      "href",
      "tel:100",
    );
    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(screen.queryByText("Connaught Place PS")).not.toBeInTheDocument();
  });
});
