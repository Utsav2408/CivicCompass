import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { MapView } from "@/features/map/components/MapView";

vi.mock("@vis.gl/react-google-maps", () => ({
  Map: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  AdvancedMarker: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" data-testid="marker" onClick={onClick}>
      {children}
    </button>
  ),
  Pin: () => <div data-testid="pin" />,
  useMap: () => null,
  useMapsLibrary: () => null,
}));
vi.mock("@/features/map/components/PoliceStationMarker", () => ({
  PoliceStationMarker: () => <div data-testid="station-marker" />,
}));

describe("MapView", () => {
  it("renders booth/user/station markers", () => {
    render(
      <MapView
        center={{ lat: 1, lng: 2 }}
        userCoords={{ lat: 1, lng: 2 }}
        searchedPlace={null}
        booth={{
          id: "b1",
          name: "Booth",
          address: "a",
          city: "c",
          coordinates: { lat: 1, lng: 2 },
          wardName: "w",
          wardCode: "w1",
          constituency: "cc",
          boothNumber: "1",
        }}
        stations={[
          {
            id: "s1",
            name: "Station",
            address: "a",
            city: "c",
            state: "s",
            latitude: 1,
            longitude: 2,
            phone: "100",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("map")).toBeInTheDocument();
    expect(screen.getAllByTestId("marker").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("station-marker")).toBeInTheDocument();
  });

  it("renders multi-booth markers and triggers booth select callback", () => {
    const onBoothSelect = vi.fn();

    render(
      <MapView
        center={{ lat: 1, lng: 2 }}
        userCoords={null}
        searchedPlace={{ lat: 3, lng: 4 }}
        booth={null}
        boothMarkers={[
          {
            id: "b1",
            name: "Booth 1",
            address: "a",
            city: "c",
            coordinates: { lat: 1, lng: 2 },
            wardName: "w1",
            wardCode: "w1",
            constituency: "cc",
            boothNumber: "1",
          },
          {
            id: "b2",
            name: "Booth 2",
            address: "a2",
            city: "c",
            coordinates: { lat: 3, lng: 4 },
            wardName: "w2",
            wardCode: "w2",
            constituency: "cc",
            boothNumber: "2",
          },
        ]}
        onBoothSelect={onBoothSelect}
        stations={[]}
      />,
    );

    const markers = screen.getAllByTestId("marker");
    expect(markers.length).toBe(3); // 2 booth markers + searched place marker

    markers.forEach((marker) => {
      fireEvent.click(marker);
    });
    expect(onBoothSelect).toHaveBeenCalled();
  });
});
