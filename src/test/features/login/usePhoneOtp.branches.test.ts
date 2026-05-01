import { act, renderHook, waitFor } from "@testing-library/react";
import { signInWithPhoneNumber } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePhoneOtp } from "@/features/login/usePhoneOtp";

vi.mock("@/lib/firebase", () => ({ auth: { currentUser: null } }));
vi.mock("firebase/auth", () => ({
  PhoneAuthProvider: { credential: vi.fn() },
  RecaptchaVerifier: vi.fn(() => ({ clear: vi.fn() })),
  linkWithCredential: vi.fn(),
  signInWithPhoneNumber: vi.fn(),
}));

describe("usePhoneOtp extra branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when verifyOtp is called before sendOtp", async () => {
    const { result } = renderHook(() => usePhoneOtp());
    await expect(result.current.verifyOtp("123456")).rejects.toThrow(
      "No pending OTP verification.",
    );
  });

  it("sets error when confirm rejects", async () => {
    vi.mocked(signInWithPhoneNumber).mockResolvedValue({
      confirm: vi.fn().mockRejectedValue(new Error("invalid otp")),
    } as never);
    const { result } = renderHook(() => usePhoneOtp());
    await act(async () => {
      await result.current.sendOtp("+911234567890", "recaptcha");
    });
    await act(async () => {
      await expect(result.current.verifyOtp("000000")).rejects.toThrow("invalid otp");
    });
    await waitFor(() => {
      expect(result.current.error).toBe("invalid otp");
    });
  });
});
