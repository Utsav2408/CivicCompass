import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BoothBottomSheet } from "@/features/map/components/BoothBottomSheet";
import type { PollingBooth } from "@/shared/types/map";

vi.mock("@/shared/utils/haversine", () => ({
  getDistance: vi.fn(() => 2.5),
}));

describe("BoothBottomSheet", () => {
  const mockBooth: PollingBooth = {
    id: "booth-1",
    name: "Model School",
    address: "Central Delhi",
    coordinates: { lat: 28.6, lng: 77.2 },
    wardName: "Ward 1",
    wardCode: "W1",
    constituency: "New Delhi",
    city: "New Delhi",
    boothNumber: "42",
  };

  it("renders booth information correctly", () => {
    render(<BoothBottomSheet booth={mockBooth} userCoords={{ lat: 28.5, lng: 77.1 }} />);
    
    expect(screen.getByText("Model School")).toBeInTheDocument();
    expect(screen.getByText("Central Delhi")).toBeInTheDocument();
    expect(screen.getByText("2.5 km away")).toBeInTheDocument();
    expect(screen.getByText(/Source: ECI Voter Portal/)).toBeInTheDocument();
  });

  it("generates correct Google Maps directions link", () => {
    render(<BoothBottomSheet booth={mockBooth} userCoords={null} />);
    
    const directionsLink = screen.getByRole("link", { name: /Get Directions/i });
    expect(directionsLink).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=28.6,77.2"
    );
    expect(directionsLink).toHaveAttribute("target", "_blank");
  });
});
