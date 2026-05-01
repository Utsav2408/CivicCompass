import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PollingBoothMap } from "@/features/map/components/PollingBoothMap";

const {
  usePollingBoothMock,
  useAllPollingBoothsMock,
  useUserLocationMock,
  useWardSearchMock,
  usePoliceStationsMock,
  useOfflineStatusMock,
} = vi.hoisted(() => ({
  usePollingBoothMock: vi.fn(),
  useAllPollingBoothsMock: vi.fn(),
  useUserLocationMock: vi.fn(),
  useWardSearchMock: vi.fn(),
  usePoliceStationsMock: vi.fn(),
  useOfflineStatusMock: vi.fn(),
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  useMapsLibrary: () => null,
}));
vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => useOfflineStatusMock(),
}));
vi.mock("@/features/map/hooks/usePollingBooth", () => ({
  usePollingBooth: (...args: unknown[]) => usePollingBoothMock(...args),
}));
vi.mock("@/features/map/hooks/useAllPollingBooths", () => ({
  useAllPollingBooths: (...args: unknown[]) => useAllPollingBoothsMock(...args),
}));
vi.mock("@/features/map/hooks/useUserLocation", () => ({
  useUserLocation: () => useUserLocationMock(),
}));
vi.mock("@/features/map/hooks/useWardSearch", () => ({
  useWardSearch: (...args: unknown[]) => useWardSearchMock(...args),
}));
vi.mock("@/features/map/hooks/usePoliceStations", () => ({
  usePoliceStations: (...args: unknown[]) => usePoliceStationsMock(...args),
}));
vi.mock("@/features/map/components/WardSearchBar", () => ({
  WardSearchBar: () => <div data-testid="ward-search" />,
}));
vi.mock("@/features/map/components/MapView", () => ({
  MapView: ({
    boothMarkers,
    showDirections,
    onDirectionsError,
  }: {
    boothMarkers?: unknown[];
    showDirections?: boolean;
    onDirectionsError?: (reason: string) => void;
  }) => (
    <div data-testid="map-view">
      <div data-testid="map-view-markers-count">{boothMarkers?.length ?? 0}</div>
      <div data-testid="map-view-show-directions">{showDirections ? "yes" : "no"}</div>
      <button
        type="button"
        onClick={() => {
          onDirectionsError?.("REQUEST_DENIED");
        }}
      >
        trigger-directions-error
      </button>
    </div>
  ),
}));
vi.mock("@/features/map/components/BoothBottomSheet", () => ({
  BoothBottomSheet: ({
    onGetDirections,
  }: {
    onGetDirections?: () => void;
  }) => (
    <div data-testid="booth-sheet">
      <button type="button" onClick={onGetDirections}>
        get-directions
      </button>
    </div>
  ),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  SectionLoader: () => <div data-testid="section-loader" />,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
  ScreenEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe("PollingBoothMap (lightweight)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(() => {
        store.clear();
      }),
    });
    useUserLocationMock.mockReturnValue({
      coords: { lat: 1, lng: 2 },
      requestCurrentLocation: vi.fn(),
      permissionState: "granted",
      error: null,
    });
    useWardSearchMock.mockReturnValue({ results: [], isSearching: false });
    usePoliceStationsMock.mockReturnValue({ stations: [], error: null });
    useOfflineStatusMock.mockReturnValue(false);
  });

  it("renders selected booth and map shell", () => {
    usePollingBoothMock.mockReturnValue({
      booth: {
        id: "b1",
        name: "Booth 1",
        address: "Address",
        city: "Delhi",
        coordinates: { lat: 10, lng: 20 },
        wardName: "Ward",
        wardCode: "W1",
        constituency: "Cons",
        boothNumber: "12",
      },
      isLoading: false,
      error: null,
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    expect(screen.getByTestId("ward-search")).toBeInTheDocument();
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
    expect(screen.getByTestId("booth-sheet")).toBeInTheDocument();
  });

  it("shows empty state when no booth data exists", () => {
    usePollingBoothMock.mockReturnValue({
      booth: null,
      isLoading: false,
      error: null,
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    expect(screen.getByText(/no polling booth data/i)).toBeInTheDocument();
  });

  it("shows map error state when polling booth hook returns error", () => {
    usePollingBoothMock.mockReturnValue({
      booth: null,
      isLoading: false,
      error: new Error("Map fetch failed"),
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    expect(screen.getByText("Map fetch failed")).toBeInTheDocument();
  });

  it("shows offline banner when offline and booth exists", () => {
    useOfflineStatusMock.mockReturnValue(true);
    usePollingBoothMock.mockReturnValue({
      booth: {
        id: "b1",
        name: "Booth 1",
        address: "Address",
        city: "Delhi",
        coordinates: { lat: 10, lng: 20 },
        wardName: "Ward",
        wardCode: "W1",
        constituency: "Cons",
        boothNumber: "12",
      },
      isLoading: false,
      error: null,
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    expect(screen.getByText(/offline - showing saved location/i)).toBeInTheDocument();
  });

  it("shows loading overlay when any async source is loading", () => {
    usePollingBoothMock.mockReturnValue({
      booth: null,
      isLoading: true,
      error: null,
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    expect(screen.getByTestId("section-loader")).toBeInTheDocument();
  });

  it("shows location permission guidance when coords are missing and error exists", () => {
    useUserLocationMock.mockReturnValue({
      coords: null,
      requestCurrentLocation: vi.fn(),
      permissionState: "prompt",
      error: "location-unavailable",
    });
    usePollingBoothMock.mockReturnValue({
      booth: null,
      isLoading: false,
      error: null,
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    expect(
      screen.getByText(/location is off\. tap "enable location to proceed"/i),
    ).toBeInTheDocument();
  });

  it("shows all booth markers when user has no active booth", () => {
    usePollingBoothMock.mockReturnValue({
      booth: null,
      isLoading: false,
      error: null,
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [
        {
          id: "b1",
          name: "Booth 1",
          address: "Address 1",
          city: "Delhi",
          coordinates: { lat: 10, lng: 20 },
          wardName: "Ward 1",
          wardCode: "W1",
          constituency: "Cons",
          boothNumber: "11",
        },
        {
          id: "b2",
          name: "Booth 2",
          address: "Address 2",
          city: "Delhi",
          coordinates: { lat: 11, lng: 21 },
          wardName: "Ward 2",
          wardCode: "W2",
          constituency: "Cons",
          boothNumber: "12",
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    expect(screen.getByTestId("map-view-markers-count")).toHaveTextContent("2");
  });

  it("falls back to Google Maps and shows directions error banner", () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    usePollingBoothMock.mockReturnValue({
      booth: {
        id: "b1",
        name: "Booth 1",
        address: "Address",
        city: "Delhi",
        coordinates: { lat: 10, lng: 20 },
        wardName: "Ward",
        wardCode: "W1",
        constituency: "Cons",
        boothNumber: "12",
      },
      isLoading: false,
      error: null,
    });
    useAllPollingBoothsMock.mockReturnValue({
      booths: [],
      isLoading: false,
      error: null,
    });

    render(<PollingBoothMap initialCoords={null} />);
    fireEvent.click(screen.getByRole("button", { name: "trigger-directions-error" }));

    expect(screen.getByText(/in-app route unavailable \(REQUEST_DENIED\)/i)).toBeInTheDocument();
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
  });
});
