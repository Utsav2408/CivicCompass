import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/features/login/useAuth";
import { useGeminiChat } from "@/features/process/hooks/useGeminiChat";

// Mock Firebase App Check — its type resolution causes unsafe-call lint errors but is logically correct
vi.mock("firebase/app-check", () => ({
  getAppCheck: vi.fn(() => ({ app: {} })),
  getToken: vi.fn(() => Promise.resolve({ token: "mock-appcheck-token" })),
}));

vi.mock("@/lib/firebase", () => ({ default: {} }));

vi.mock("@/features/login/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { uid: "test-uid" } })),
}));

describe("useGeminiChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("send() appends a user message then an assistant message to messages array", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          response: "Nomination starts after ECI schedule.",
          source: "eci.gov.in",
          fromCache: false,
        }),
    } as Response);

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.send("Tell me about the election process");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      text: "Tell me about the election process",
    });
    expect(result.current.messages[1]).toMatchObject({
      role: "model",
      text: "Nomination starts after ECI schedule.",
    });
  });

  it("isLoading is true during fetch and false after", async () => {
    let resolveResponse!: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });

    vi.spyOn(global, "fetch").mockImplementation(() =>
      pendingPromise.then(
        () =>
          ({
            ok: true,
            json: () =>
              Promise.resolve({
                response: "Response text.",
                source: "eci.gov.in",
                fromCache: false,
              }),
          }) as Response,
      ),
    );

    const { result } = renderHook(() => useGeminiChat());

    act(() => {
      void result.current.send("a question");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    resolveResponse(undefined);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("response includes a source field extracted from the fixture", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          response: "ECI data response.",
          source: "eci.gov.in",
          fromCache: false,
        }),
    } as Response);

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.send("What is the election process?");
    });

    const aiMsg = result.current.messages.find((m) => m.role === "model");
    expect(aiMsg?.source).toBe("eci.gov.in");
  });

  it("network error sets error and clears isLoading", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.send("a question");
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("returns early without fetch when user is not authenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as never);

    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.send("a question");
    });

    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
