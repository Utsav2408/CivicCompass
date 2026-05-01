import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MessageBubble } from "@/features/support/components/MessageBubble";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => fallback ?? k,
  }),
}));

describe("MessageBubble", () => {
  it("renders AI message with source badge", () => {
    render(
      <MessageBubble
        message={{
          role: "model",
          text: "Use ECI portal",
          source: "eci.gov.in",
        }}
      />,
    );
    expect(screen.getByText("Use ECI portal")).toBeInTheDocument();
    expect(screen.getByText(/source/i)).toBeInTheDocument();
    expect(screen.getByText(/eci.gov.in/i)).toBeInTheDocument();
  });

  it("renders user message without AI label", () => {
    render(<MessageBubble message={{ role: "user", text: "Hi" }} />);
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.queryByText(/civiccompass ai/i)).toBeNull();
  });
});
