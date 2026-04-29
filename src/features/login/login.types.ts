import type { UserProfile } from "@/shared/types/user";

/**
 * Personalization flow steps for Screen 1.1
 */
export const PersonalizationStep = {
  Identity: "identity",
  Preferences: "preferences",
  Confirm: "confirm",
} as const;

export type PersonalizationStep =
  (typeof PersonalizationStep)[keyof typeof PersonalizationStep];

/**
 * Partial profile used during the multi-step personalization form
 */
export type PartialProfile = Partial<UserProfile>;

/**
 * State for the personalization flow
 */
export interface PersonalizationState {
  step: PersonalizationStep;
  profile: PartialProfile;
  isSubmitting: boolean;
  error: string | null;
}
