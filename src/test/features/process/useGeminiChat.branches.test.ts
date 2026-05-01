import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGeminiChat } from "@/features/process/hooks/useGeminiChat";

vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));

describe("useGeminiChat branch coverage", () => {
  it("sets API error message when response is not ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Proxy failed" }),
    } as Response);

    const { result } = renderHook(() => useGeminiChat());
    await act(async () => {
      await result.current.send("hello");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Proxy failed");
      expect(result.current.isLoading).toBe(false);
    });
  });
});
