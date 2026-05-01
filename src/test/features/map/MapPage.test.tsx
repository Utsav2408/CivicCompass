import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { MapPage } from "@/features/map/MapPage";

const mockPollingBoothMap = vi.fn();

vi.mock("@/features/map/components/PollingBoothMap", () => ({
  PollingBoothMap: (props: {
    initialCoords: { lat: number; lng: number } | null;
  }) => {
    mockPollingBoothMap(props);
    return <div data-testid="polling-booth-map">Map</div>;
  },
}));

vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  PageLoader: () => <div data-testid="page-loader">Loading</div>,
}));
vi.mock("@/shared/components/BottomNav", () => ({
  BottomNav: () => <div data-testid="bottom-nav">Bottom nav</div>,
}));

describe("MapPage", () => {
  it("passes parsed lat/lng from query string to PollingBoothMap", () => {
    render(
      <MemoryRouter initialEntries={["/map?lat=28.6139&lng=77.2090"]}>
        <MapPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("polling-booth-map")).toBeInTheDocument();
    expect(mockPollingBoothMap).toHaveBeenCalledWith({
      initialCoords: { lat: 28.6139, lng: 77.209 },
    });
  });

  it("passes null initialCoords when query params are missing/invalid", () => {
    render(
      <MemoryRouter initialEntries={["/map?lat=abc"]}>
        <MapPage />
      </MemoryRouter>,
    );

    expect(mockPollingBoothMap).toHaveBeenCalledWith({ initialCoords: null });
  });
});
