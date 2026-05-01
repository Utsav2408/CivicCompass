import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ElectionTypeToggle } from "@/features/process/components/ElectionTypeToggle";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe("Process ElectionTypeToggle", () => {
  it("renders and triggers onChange", () => {
    const onChange = vi.fn();
    render(<ElectionTypeToggle value="lok_sabha" onChange={onChange} />);

    const vidhan = screen.getByRole("radio", {
      name: "process.types.vidhan_sabha",
    });
    fireEvent.click(vidhan);
    expect(onChange).toHaveBeenCalledWith("vidhan_sabha");
  });
});
