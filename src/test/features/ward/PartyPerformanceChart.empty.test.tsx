import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PartyPerformanceChart } from "@/features/ward/components/PartyPerformanceChart";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));

describe("PartyPerformanceChart empty branch", () => {
  it("returns null when no party data provided", () => {
    const { container } = render(<PartyPerformanceChart parties={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
