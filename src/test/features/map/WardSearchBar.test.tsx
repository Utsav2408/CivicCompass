import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WardSearchBar } from "@/features/map/components/WardSearchBar";

describe("WardSearchBar", () => {
  it("updates the search value and stays collapsed without results", () => {
    const onChange = vi.fn();

    render(
      <WardSearchBar
        value="Con"
        onChange={onChange}
        boothResults={[]}
        placeResults={[]}
        onSelectBooth={vi.fn()}
        onSelectPlace={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Search by Ward Name");
    expect(input).toHaveValue("Con");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Connaught Place" } });
    expect(onChange).toHaveBeenCalledWith("Connaught Place");
  });

  it("renders place and booth results and invokes selection callbacks", () => {
    const onSelectBooth = vi.fn();
    const onSelectPlace = vi.fn();

    render(
      <WardSearchBar
        value=""
        onChange={vi.fn()}
        placeResults={[
          {
            id: "p-1",
            title: "Connaught Place",
            subtitle: "New Delhi",
            coordinates: { lat: 28.6315, lng: 77.2167 },
          },
          {
            id: "p-2",
            title: "Rajouri Garden",
            coordinates: { lat: 28.6496, lng: 77.1227 },
          },
        ]}
        boothResults={[
          {
            id: "b-1",
            name: "Govt School Booth",
            address: "Street 1",
            city: "Delhi",
            coordinates: { lat: 28.63, lng: 77.21 },
            wardName: "Ward 10",
            wardCode: "10",
            constituency: "New Delhi",
            boothNumber: "42",
          },
        ]}
        onSelectBooth={onSelectBooth}
        onSelectPlace={onSelectPlace}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Connaught Place")).toBeInTheDocument();
    expect(screen.getByText("New Delhi")).toBeInTheDocument();
    expect(screen.getByText("Rajouri Garden")).toBeInTheDocument();
    expect(screen.getByText("Ward 10")).toBeInTheDocument();
    expect(screen.getByText("Govt School Booth")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /connaught place/i }));
    expect(onSelectPlace).toHaveBeenCalledWith({
      id: "p-1",
      title: "Connaught Place",
      subtitle: "New Delhi",
      coordinates: { lat: 28.6315, lng: 77.2167 },
    });

    fireEvent.click(screen.getByRole("button", { name: /ward 10/i }));
    expect(onSelectBooth).toHaveBeenCalledWith({
      id: "b-1",
      name: "Govt School Booth",
      address: "Street 1",
      city: "Delhi",
      coordinates: { lat: 28.63, lng: 77.21 },
      wardName: "Ward 10",
      wardCode: "10",
      constituency: "New Delhi",
      boothNumber: "42",
    });
  });
});
