import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ElectionTypeToggle } from "@/features/ward/components/ElectionTypeToggle";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));

describe("ElectionTypeToggle", () => {
  it("renders options and calls onChange with selected value", () => {
    const onChange = vi.fn();
    render(<ElectionTypeToggle value="lok_sabha" onChange={onChange} />);

    const lokSabha = screen.getByRole("button", { name: "Lok Sabha" });
    const vidhanSabha = screen.getByRole("button", { name: "Vidhan Sabha" });

    expect(lokSabha).toHaveAttribute("aria-pressed", "true");
    expect(vidhanSabha).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(vidhanSabha);
    expect(onChange).toHaveBeenCalledWith("vidhan_sabha");
  });
});
