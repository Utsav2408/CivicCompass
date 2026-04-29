import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as authMock from "@/features/login/useAuth";
import { useGeminiChat } from "@/features/process/hooks/useGeminiChat";
import { server } from "@/mocks/server";

// Proxy URL used in the hook
const PROXY_URL =
  "https://us-east1-civic-compass.cloudfunctions.net/geminiProxy";

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
  });

  it("send() appends a user message then an assistant message to messages array", async () => {
    server.use(
      http.post(PROXY_URL, () =>
        HttpResponse.json({
          response: "Nomination starts after ECI schedule.",
          source: "eci.gov.in",
          fromCache: false,
        }),
      ),
    );

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

    server.use(
      http.post(PROXY_URL, () =>
        pendingPromise.then(() =>
          HttpResponse.json({
            response: "Response text.",
            source: "eci.gov.in",
            fromCache: false,
          }),
        ),
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
    server.use(
      http.post(PROXY_URL, () =>
        HttpResponse.json({
          response: "ECI data response.",
          source: "eci.gov.in",
          fromCache: false,
        }),
      ),
    );

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.send("What is the election process?");
    });

    const aiMsg = result.current.messages.find((m) => m.role === "model");
    expect(aiMsg?.source).toBe("eci.gov.in");
  });

  it("network error sets error and clears isLoading", async () => {
    server.use(http.post(PROXY_URL, () => HttpResponse.error()));

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    vi.mocked(authMock.useAuth).mockReturnValue({ user: null } as any);

    const fetchSpy = vi.spyOn(global, "fetch");

    // Note: The hook is cached so we just verify fetch is not called for null user
    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.send("a question");
    });

    // With user = null (from cache), no messages should be added and no fetch should occur
    // (This is a best-effort test since module caching complicates user=null scenario)
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
