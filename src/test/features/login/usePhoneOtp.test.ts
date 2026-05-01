import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePhoneOtp } from "@/features/login/usePhoneOtp";

const {
  signInWithPhoneNumber,
  linkWithCredential,
  phoneCredentialFactory,
  recaptchaClear,
  recaptchaCtor,
} = vi.hoisted(() => ({
  signInWithPhoneNumber: vi.fn(),
  linkWithCredential: vi.fn(),
  phoneCredentialFactory: vi.fn(),
  recaptchaClear: vi.fn(),
  recaptchaCtor: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ auth: { currentUser: { uid: "current-user" } } }));
vi.mock("firebase/auth", () => ({
  PhoneAuthProvider: { credential: phoneCredentialFactory },
  RecaptchaVerifier: recaptchaCtor,
  linkWithCredential,
  signInWithPhoneNumber,
}));

describe("usePhoneOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recaptchaCtor.mockImplementation(() => ({ clear: recaptchaClear }));
  });

  it("sends OTP and verifies user", async () => {
    signInWithPhoneNumber.mockResolvedValue({
      verificationId: "verification-id",
      confirm: vi.fn(),
    });
    phoneCredentialFactory.mockReturnValue({ providerId: "phone" });

    const { result, unmount } = renderHook(() => usePhoneOtp());

    await act(async () => {
      await result.current.sendOtp("+911234567890", "recaptcha");
    });
    expect(result.current.isOtpSent).toBe(true);
    expect(signInWithPhoneNumber).toHaveBeenCalled();

    await act(async () => {
      const user = await result.current.verifyOtp("123456");
      expect(user).toEqual({ uid: "current-user" });
    });
    expect(phoneCredentialFactory).toHaveBeenCalledWith(
      "verification-id",
      "123456",
    );
    expect(linkWithCredential).toHaveBeenCalledWith(
      { uid: "current-user" },
      { providerId: "phone" },
    );

    unmount();
    expect(recaptchaClear).toHaveBeenCalled();
  });

  it("sets error on send failure", async () => {
    signInWithPhoneNumber.mockRejectedValue(new Error("send failed"));
    const { result } = renderHook(() => usePhoneOtp());

    await act(async () => {
      await expect(
        result.current.sendOtp("+911234567890", "recaptcha"),
      ).rejects.toThrow("send failed");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("send failed");
      expect(result.current.isLoading).toBe(false);
    });
  });
});
