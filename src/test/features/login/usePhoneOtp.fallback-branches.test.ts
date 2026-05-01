import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePhoneOtp } from "@/features/login/usePhoneOtp";

const { signInWithPhoneNumber, recaptchaCtor } = vi.hoisted(() => ({
  signInWithPhoneNumber: vi.fn(),
  recaptchaCtor: vi.fn(() => ({ clear: vi.fn() })),
}));

vi.mock("@/lib/firebase", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({
  RecaptchaVerifier: recaptchaCtor,
  signInWithPhoneNumber,
}));

describe("usePhoneOtp fallback branches", () => {
  it("uses fallback sendOtp error for non-Error rejection", async () => {
    signInWithPhoneNumber.mockRejectedValue("sms-broke");
    const { result } = renderHook(() => usePhoneOtp());
    await act(async () => {
      await expect(result.current.sendOtp("+911234567890", "recaptcha")).rejects.toBe(
        "sms-broke",
      );
    });
    await waitFor(() => { expect(result.current.error).toBe("Failed to send OTP."); });
  });

  it("uses fallback verifyOtp error for non-Error rejection", async () => {
    signInWithPhoneNumber.mockResolvedValue({
      confirm: vi.fn().mockRejectedValue("invalid"),
    });
    const { result } = renderHook(() => usePhoneOtp());
    await act(async () => {
      await result.current.sendOtp("+911234567890", "recaptcha");
    });
    await act(async () => {
      await expect(result.current.verifyOtp("000000")).rejects.toBe("invalid");
    });
    await waitFor(() => { expect(result.current.error).toBe("Invalid OTP code."); });
  });
});
