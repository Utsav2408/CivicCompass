import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { PersonalizationStep } from "@features/login/login.types";
import { usePersonalization } from "@features/login/usePersonalization";
import { createUserProfile } from "@shared/utils/createUserProfile";

// Mock createUserProfile util
vi.mock("@shared/utils/createUserProfile", () => ({
  createUserProfile: vi.fn(),
}));

describe("usePersonalization hook", () => {
  const mockUid = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with Step 1 (Identity) and empty form data", () => {
    const { result } = renderHook(() => usePersonalization(mockUid));
    expect(result.current.step).toBe(PersonalizationStep.Identity);
    expect(result.current.formData).toEqual({});
  });

  it("should update form data", () => {
    const { result } = renderHook(() => usePersonalization(mockUid));
    act(() => {
      result.current.updateFormData({ name: "John Doe" });
    });
    expect(result.current.formData.name).toBe("John Doe");
  });

  it("should navigate between steps", () => {
    const { result } = renderHook(() => usePersonalization(mockUid));

    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe(PersonalizationStep.Preferences);

    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe(PersonalizationStep.Confirm);

    act(() => {
      result.current.goBack();
    });
    expect(result.current.step).toBe(PersonalizationStep.Preferences);
  });

  it("should fail submission if name is missing on complete flow", async () => {
    const { result } = renderHook(() => usePersonalization(mockUid));
    let success = false;
    await act(async () => {
      success = await result.current.submit(true);
    });
    expect(success).toBe(false);
    expect(result.current.errors.submit).toBe("Name is required");
  });

  it("should succeed submission and call createUserProfile with isComplete: true", async () => {
    const { result } = renderHook(() => usePersonalization(mockUid));
    vi.mocked(createUserProfile).mockResolvedValue(undefined);

    act(() => {
      result.current.updateFormData({ name: "John Doe" });
    });

    let success = false;
    await act(async () => {
      success = await result.current.submit(true);
    });

    expect(success).toBe(true);
    expect(createUserProfile).toHaveBeenCalledWith(
      mockUid,
      expect.objectContaining({
        name: "John Doe",
        isComplete: true,
      }),
    );
  });

  it("should handle skip flow by calling createUserProfile with isComplete: false", async () => {
    const { result } = renderHook(() => usePersonalization(mockUid));
    vi.mocked(createUserProfile).mockResolvedValue(undefined);

    let success = false;
    await act(async () => {
      success = await result.current.submit(false);
    });

    expect(success).toBe(true);
    expect(createUserProfile).toHaveBeenCalledWith(
      mockUid,
      expect.objectContaining({
        isComplete: false,
      }),
    );
  });

  it("should set setStep directly", () => {
    const { result } = renderHook(() => usePersonalization(mockUid));
    act(() => {
      result.current.setStep(PersonalizationStep.Confirm);
    });
    expect(result.current.step).toBe(PersonalizationStep.Confirm);
  });

  it("should handle errors from createUserProfile", async () => {
    const { result } = renderHook(() => usePersonalization(mockUid));
    vi.mocked(createUserProfile).mockRejectedValue(
      new Error("Firestore error"),
    );

    act(() => {
      result.current.updateFormData({ name: "John Doe" });
    });

    let success = false;
    await act(async () => {
      success = await result.current.submit(true);
    });

    expect(success).toBe(false);
    expect(result.current.errors.submit).toBe("Firestore error");
  });
});
