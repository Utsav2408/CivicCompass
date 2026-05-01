import { renderHook, waitFor } from "@testing-library/react";
import * as firestore from "firebase/firestore";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as authHook from "@/features/login/useAuth";
import { useWardCandidates } from "@/features/ward/hooks/useWardCandidates";


// Mock Firebase auth
vi.mock("@/features/login/useAuth");

// Mock Firestore
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("useWardCandidates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authHook.useAuth).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      user: { uid: "test-uid" } as any,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
    });

    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ nominationDeadline: "2024-04-04" }),
    } as unknown as firestore.DocumentSnapshot);

    // MSW will handle the fetch in candidate-fetch, using New Delhi PC-01 to trigger cache hit from handlers
  });

  it("cache hit returns Firestore data from MSW handler", async () => {
    const { result } = renderHook(() =>
      useWardCandidates("New Delhi PC-01", "lok_sabha"),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.candidates).toHaveLength(2);
    expect(result.current.candidates[0]?.name).toBe("Pravesh Verma");
    expect(result.current.nominationDeadline).toBe("2024-04-04");
  });

  it("cache miss returns empty array or fetches new data", async () => {
    // Other constituency returns empty array in our MSW mock
    const { result } = renderHook(() =>
      useWardCandidates("Other Constituency", "lok_sabha"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.candidates).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("handles nomination deadline before today properly by setting the deadline state", async () => {
    // getDoc returns an old date
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ nominationDeadline: "2020-01-01" }),
    } as unknown as firestore.DocumentSnapshot);

    const { result } = renderHook(() =>
      useWardCandidates("New Delhi PC-01", "lok_sabha"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nominationDeadline).toBe("2020-01-01");
  });

  it("does not fetch if constituencyId is null", async () => {
    const { result } = renderHook(() => useWardCandidates(null, "lok_sabha"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.candidates).toEqual([]);
    expect(firestore.getDoc).not.toHaveBeenCalled();
  });
});
