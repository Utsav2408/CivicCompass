import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmergencyOverlay } from "@/features/support/components/EmergencyOverlay";

const cancel = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string, vars?: { eta?: number }) =>
      fallback?.replace("{{eta}}", String(vars?.eta ?? 3)) ?? _k,
  }),
}));
vi.mock("@/features/support/hooks/useEmergency", () => ({
  useEmergency: () => ({
    isActive: true,
    cancel,
    eta: 4,
    nearestStation: {
      name: "PS Central",
      phone: "100",
      latitude: 28.61,
      longitude: 77.2,
    },
  }),
}));
vi.mock("@/features/map/hooks/useUserLocation", () => ({
  useUserLocation: () => ({ coords: { lat: 28.6, lng: 77.2 } }),
}));
vi.mock("@vis.gl/react-google-maps", () => ({
  Map: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  AdvancedMarker: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  Pin: () => <div>pin</div>,
  useMap: () => ({}),
  useMapsLibrary: () => null,
}));

describe("EmergencyOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders alerting state then alerted map and handles cancel", () => {
    render(<EmergencyOverlay />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Alerting Authorities/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /cancel emergency alert/i }),
    );
    expect(cancel).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByText(/Police Alerted/i)).toBeInTheDocument();
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });
});
