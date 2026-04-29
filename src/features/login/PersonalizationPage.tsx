import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";

import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import { JaaliHero } from "@/shared/components/MughalJaaliPattern";

import { useProfileRoute } from "./ProfileRouteContext";
import { PersonalizationStep } from "./login.types";
import { useAuth } from "./useAuth";
import { usePersonalization } from "./usePersonalization";
import { usePhoneOtp } from "./usePhoneOtp";

interface EciLookupResponse {
  constituency: string;
  pollingBooth: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  wardCode: string;
}

/**
 * PersonalizationPage — Screen 1.1
 *
 * A 3-step onboarding flow to collect user details (Voter ID, Preferences).
 * Uses the Rang Mahal design system with a parchment background.
 */
export function PersonalizationPage() {
  const { t, i18n } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { refreshProfile, allowIncompleteForSession } = useProfileRoute();

  const {
    step,
    setStep,
    formData,
    updateFormData,
    goNext,
    goBack,
    submit,
    isSubmitting,
  } = usePersonalization(user?.uid ?? "");

  const {
    sendOtp,
    verifyOtp,
    isLoading: isOtpLoading,
    isOtpSent,
  } = usePhoneOtp();

  const [voterIdError, setVoterIdError] = useState<string | null>(null);
  const [isValidatingVoterId, setIsValidatingVoterId] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const steps = [
    PersonalizationStep.Identity,
    PersonalizationStep.Preferences,
    PersonalizationStep.Confirm,
  ];

  const currentStepIndex = steps.indexOf(step);

  const handleSkip = async () => {
    // Mark profile as intentionally incomplete and go home for this session.
    // allowIncompleteForSession() permits /home until sign-out.
    // On next login, ProtectedRoute re-checks Firestore and requires completion.
    await submit(false);
    allowIncompleteForSession();
    void navigate("/home", { replace: true });
  };

  const handleVoterIdBlur = async (voterId: string) => {
    if (!voterId || voterId.length < 10) return;

    setIsValidatingVoterId(true);
    setVoterIdError(null);
    try {
      // Call eciVoterLookup Cloud Function
      // For now, we simulate the fetch as per the mock in the function
      const response = await fetch(
        "https://us-east1-civic-compass.cloudfunctions.net/eciVoterLookup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-uid": user.uid,
          },
          body: JSON.stringify({ voterId }),
        },
      );

      if (!response.ok) throw new Error("Lookup failed");

      const data = (await response.json()) as EciLookupResponse;
      updateFormData({
        voterIdNumber: voterId,
        constituency: data.constituency,
        pollingBooth: data.pollingBooth,
      });
    } catch {
      setVoterIdError(t("personalization.identity.voter_id_error"));
    } finally {
      setIsValidatingVoterId(false);
    }
  };

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--pg)", // Parchment background
        overflow: "hidden",
      }}
      aria-label={t("personalization.title")}
    >
      <JaaliHero />

      {/* Progress Indicator */}
      <div
        role="progressbar"
        aria-valuenow={((currentStepIndex + 1) / steps.length) * 100}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          position: "relative",
          zIndex: "var(--z-raised)",
          padding: "var(--space-md) var(--space-xl)",
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-sm)",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={s}
            style={{
              height: "4px",
              width: "60px",
              borderRadius: "var(--radius-full)",
              background: i <= currentStepIndex ? "var(--sf)" : "var(--border)",
              transition: "var(--transition-base)",
            }}
          />
        ))}
      </div>

      <section
        style={{
          position: "relative",
          zIndex: "var(--z-raised)",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-lg)",
        }}
      >
        <div
          style={{
            background: "var(--paper)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-xl)",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
          }}
        >
          {step === PersonalizationStep.Identity && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <h2 style={{ font: "var(--text-h1)", color: "var(--in)" }}>
                {t("personalization.step_identity")}
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-xs)",
                }}
              >
                <label style={{ font: "var(--text-h2)" }}>
                  {t("personalization.identity.name_label")}
                </label>
                <input
                  type="text"
                  placeholder={t("personalization.identity.name_placeholder")}
                  value={formData.name ?? ""}
                  onChange={(e) => {
                    updateFormData({ name: e.target.value });
                  }}
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-xs)",
                }}
              >
                <label style={{ font: "var(--text-h2)" }}>
                  {t("personalization.identity.voter_id_label")}
                </label>
                <input
                  type="text"
                  placeholder={t("personalization.identity.voter_id_hint")}
                  onBlur={(e) => {
                    void handleVoterIdBlur(e.target.value);
                  }}
                  style={inputStyle}
                />
                {isValidatingVoterId && (
                  <p style={{ fontSize: "12px", color: "var(--in)" }}>
                    {t("personalization.identity.validating")}
                  </p>
                )}
                {voterIdError && (
                  <p
                    role="alert"
                    style={{ fontSize: "12px", color: "var(--lo-text)" }}
                  >
                    {voterIdError}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-xs)",
                }}
              >
                <label style={{ font: "var(--text-h2)" }}>
                  {t("personalization.identity.phone_label")}
                </label>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <input
                    type="tel"
                    placeholder={t(
                      "personalization.identity.phone_placeholder",
                    )}
                    style={{ ...inputStyle, flex: 1 }}
                    id="phone-input"
                  />
                  <button
                    id="recaptcha-container"
                    onClick={() => {
                      void sendOtp(
                        (
                          document.getElementById(
                            "phone-input",
                          ) as HTMLInputElement
                        ).value,
                        "recaptcha-container",
                      );
                    }}
                    style={buttonSecondaryStyle}
                    disabled={isOtpLoading}
                  >
                    {isOtpLoading ? (
                      <AshokaCakraLoader size={16} />
                    ) : (
                      t("personalization.identity.send_otp")
                    )}
                  </button>
                </div>
              </div>

              {isOtpSent && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-xs)",
                  }}
                >
                  <label style={{ font: "var(--text-h2)" }}>
                    {t("personalization.identity.otp_label")}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => {
                      setOtpValue(e.target.value);
                    }}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => {
                      void verifyOtp(otpValue).then(() => {
                        goNext();
                      });
                    }}
                    style={buttonPrimaryStyle}
                    disabled={isOtpLoading || otpValue.length < 6}
                  >
                    {t("personalization.identity.verify_otp")}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  void handleSkip();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "13px",
                }}
              >
                {t("personalization.skip")}
              </button>
            </div>
          )}

          {step === PersonalizationStep.Preferences && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <h2 style={{ font: "var(--text-h1)", color: "var(--in)" }}>
                {t("personalization.step_preferences")}
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-sm)",
                }}
              >
                <label style={{ font: "var(--text-h2)" }}>
                  {t("personalization.preferences.language_label")}
                </label>
                <div style={{ display: "flex", gap: "var(--space-md)" }}>
                  <button
                    onClick={() => {
                      void i18n.changeLanguage("en");
                    }}
                    style={
                      i18n.language === "en"
                        ? buttonPrimaryStyle
                        : buttonSecondaryStyle
                    }
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      void i18n.changeLanguage("hi");
                    }}
                    style={
                      i18n.language === "hi"
                        ? buttonPrimaryStyle
                        : buttonSecondaryStyle
                    }
                  >
                    हि
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-sm)",
                }}
              >
                <label style={{ font: "var(--text-h2)" }}>
                  {t("personalization.preferences.election_type_label")}
                </label>
                {["lok_sabha", "vidhan_sabha", "both"].map((type) => (
                  <label
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-sm)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.electionInterest?.includes(type)}
                      onChange={(e) => {
                        const current = formData.electionInterest ?? [];
                        const next = e.target.checked
                          ? [...current, type]
                          : current.filter((t) => t !== type);
                        updateFormData({ electionInterest: next });
                      }}
                    />
                    <span style={{ font: "var(--text-body)" }}>
                      {t(`personalization.preferences.${type}`)}
                    </span>
                  </label>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-md)",
                  marginTop: "var(--space-md)",
                }}
              >
                <button onClick={goBack} style={buttonSecondaryStyle}>
                  {t("common.back")}
                </button>
                <button onClick={goNext} style={buttonPrimaryStyle}>
                  {t("common.next")}
                </button>
              </div>
            </div>
          )}

          {step === PersonalizationStep.Confirm && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <h2 style={{ font: "var(--text-h1)", color: "var(--in)" }}>
                {t("personalization.step_confirm")}
              </h2>

              <div
                style={{
                  background: "var(--sf-l)",
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--sf-tint)",
                }}
              >
                <h3 style={{ font: "var(--text-h2)", color: "var(--sf)" }}>
                  {t("personalization.confirm.summary_title")}
                </h3>
                <p
                  style={{
                    font: "var(--text-body)",
                    marginTop: "var(--space-xs)",
                  }}
                >
                  <strong>{t("personalization.identity.name_label")}:</strong>{" "}
                  {formData.name}
                </p>
                <p style={{ font: "var(--text-body)" }}>
                  <strong>
                    {t("personalization.identity.voter_id_label")}:
                  </strong>{" "}
                  {formData.voterIdNumber}
                </p>
                {formData.constituency && (
                  <p
                    style={{
                      font: "var(--text-body)",
                      marginTop: "var(--space-sm)",
                    }}
                  >
                    <strong>Constituency:</strong> {formData.constituency}
                  </p>
                )}
                {formData.pollingBooth && (
                  <div style={{ marginTop: "var(--space-xs)" }}>
                    <p style={{ font: "var(--text-body)" }}>
                      <strong>Booth:</strong> {formData.pollingBooth.name}
                    </p>
                    <p
                      style={{
                        font: "var(--text-small)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {formData.pollingBooth.address}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setStep(PersonalizationStep.Identity);
                }}
                style={{
                  color: "var(--in)",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                }}
              >
                {t("personalization.confirm.looks_wrong")}
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-md)",
                  marginTop: "var(--space-md)",
                }}
              >
                <button onClick={goBack} style={buttonSecondaryStyle}>
                  {t("common.back")}
                </button>
                <button
                  onClick={() => {
                    void submit().then((success) => {
                      if (success) {
                        // Tell ProtectedRoute to re-check profile before allowing /home.
                        refreshProfile();
                        void navigate("/home", { replace: true });
                      }
                    });
                  }}
                  style={buttonPrimaryStyle}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <AshokaCakraLoader size={20} />
                  ) : (
                    t("personalization.confirm.finish")
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  padding: "var(--space-sm) var(--space-md)",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--border)",
  font: "var(--text-body)",
  outline: "none",
  background: "var(--pg)",
};

const buttonPrimaryStyle = {
  flex: 1,
  padding: "var(--space-sm) var(--space-md)",
  background: "var(--sf)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-md)",
  font: "var(--text-h2)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-sm)",
};

const buttonSecondaryStyle = {
  padding: "var(--space-sm) var(--space-md)",
  background: "transparent",
  color: "var(--sf)",
  border: "1.5px solid var(--sf)",
  borderRadius: "var(--radius-md)",
  font: "var(--text-h2)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-sm)",
};
