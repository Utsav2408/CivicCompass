import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePhoneOtp } from "@/features/login/usePhoneOtp";

const { recaptchaCtor } = vi.hoisted(() => ({
  recaptchaCtor: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({
  RecaptchaVerifier: recaptchaCtor,
  signInWithPhoneNumber: vi.fn(),
}));

describe("usePhoneOtp setupRecaptcha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets error when recaptcha initialization throws", () => {
    recaptchaCtor.mockImplementation(() => {
      throw new Error("boom");
    });
    const { result } = renderHook(() => usePhoneOtp());
    act(() => {
      result.current.setupRecaptcha("recaptcha");
    });
    expect(result.current.error).toBe("Failed to initialize security check.");
  });
});
