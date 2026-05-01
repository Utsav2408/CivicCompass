import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { useState, useCallback, useEffect } from "react";

import { auth } from "@/lib/firebase";

/**
 * Hook for handling Firebase Phone OTP authentication.
 * Manages the RecaptchaVerifier lifecycle and OTP verification.
 */
export function usePhoneOtp() {
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);

  // Initialize RecaptchaVerifier
  const setupRecaptcha = useCallback(
    (containerId: string) => {
      if (verifier) return;

      try {
        const newVerifier = new RecaptchaVerifier(auth, containerId, {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
        });
        setVerifier(newVerifier);
      } catch {
        setError("Failed to initialize security check.");
      }
    },
    [verifier],
  );

  // Clean up verifier on unmount
  useEffect(() => {
    return () => {
      if (verifier) {
        verifier.clear();
      }
    };
  }, [verifier]);

  const sendOtp = async (phoneNumber: string, containerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure verifier is set up
      if (!verifier) {
        setupRecaptcha(containerId);
      }

      const v =
        verifier ??
        new RecaptchaVerifier(auth, containerId, { size: "invisible" });
      if (!verifier) setVerifier(v);

      const result = await signInWithPhoneNumber(auth, phoneNumber, v);
      setConfirmationResult(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send OTP.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    if (!confirmationResult) {
      throw new Error("No pending OTP verification.");
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;

      // Keep the active signed-in session (Google/demo) stable by linking
      // the verified phone number to it instead of switching auth users.
      if (currentUser) {
        const credential = PhoneAuthProvider.credential(
          confirmationResult.verificationId,
          otp,
        );
        await linkWithCredential(currentUser, credential);
        return currentUser;
      }

      // Fallback when no active user exists.
      const userCredential = await confirmationResult.confirm(otp);
      return userCredential.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid OTP code.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOtp,
    verifyOtp,
    isLoading,
    error,
    setupRecaptcha,
    isOtpSent: !!confirmationResult,
  };
}
