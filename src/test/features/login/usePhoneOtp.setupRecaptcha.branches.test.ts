import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePhoneOtp } from "@/features/login/usePhoneOtp";

const { signInWithPhoneNumber, recaptchaClear, recaptchaCtor } = vi.hoisted(
  () => ({
    signInWithPhoneNumber: vi.fn(),
    recaptchaClear: vi.fn(),
    recaptchaCtor: vi.fn(() => ({ clear: recaptchaClear })),
  }),
);

vi.mock("@/lib/firebase", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({
  RecaptchaVerifier: recaptchaCtor,
  signInWithPhoneNumber,
}));

describe("usePhoneOtp setupRecaptcha extra branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not recreate recaptcha verifier when already initialized", async () => {
    signInWithPhoneNumber.mockResolvedValue({ confirm: vi.fn() });
    const { result } = renderHook(() => usePhoneOtp());

    act(() => {
      result.current.setupRecaptcha("recaptcha");
    });
    act(() => {
      result.current.setupRecaptcha("recaptcha");
    });

    await act(async () => {
      await result.current.sendOtp("+911234567890", "recaptcha");
    });

    expect(recaptchaCtor).toHaveBeenCalledTimes(1);
  });

  it("accepts recaptcha callback path without changing error state", () => {
    const { result } = renderHook(() => usePhoneOtp());
    act(() => {
      result.current.setupRecaptcha("recaptcha");
    });
    const config = (
      recaptchaCtor as unknown as {
        mock: { calls: unknown[][] };
      }
    ).mock.calls[0]?.[2] as { callback?: () => void } | undefined;
    act(() => {
      config?.callback?.();
    });
    expect(result.current.error).toBeNull();
  });
});
