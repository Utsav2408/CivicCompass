import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGeminiChat } from "@/features/process/hooks/useGeminiChat";

vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));

describe("useGeminiChat fallback error branch", () => {
  it("falls back to default error string when non-Error is thrown", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue("bad");
    const { result } = renderHook(() => useGeminiChat());
    await act(async () => {
      await result.current.send("hello");
    });
    expect(result.current.error).toBe("AI service unavailable");
  });
});
