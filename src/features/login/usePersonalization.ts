import { useState, useCallback } from "react";

import { createUserProfile } from "@/shared/utils/createUserProfile";

import { PersonalizationStep, type PartialProfile } from "./login.types";

/**
 * Hook for managing the multi-step personalization flow (Screen 1.1).
 * Handles state transitions, form data, and final submission to Firestore.
 */
export function usePersonalization(uid: string) {
  const [step, setStep] = useState<PersonalizationStep>(
    PersonalizationStep.Identity,
  );
  const [formData, setFormData] = useState<PartialProfile>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = useCallback((data: PartialProfile) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const goNext = useCallback(() => {
    if (step === PersonalizationStep.Identity) {
      setStep(PersonalizationStep.Preferences);
    } else if (step === PersonalizationStep.Preferences) {
      setStep(PersonalizationStep.Confirm);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step === PersonalizationStep.Preferences) {
      setStep(PersonalizationStep.Identity);
    } else if (step === PersonalizationStep.Confirm) {
      setStep(PersonalizationStep.Preferences);
    }
  }, [step]);

  const submit = async (isComplete = true) => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Basic validation check before final write
      if (isComplete && !formData.name) {
        throw new Error("Name is required");
      }

      await createUserProfile(uid, { ...formData, isComplete });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile.";
      setErrors({ submit: message });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    formData,
    errors,
    updateFormData,
    goNext,
    goBack,
    submit,
    isSubmitting,
  };
}
