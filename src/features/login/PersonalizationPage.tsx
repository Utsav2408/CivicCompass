import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { getToken } from "firebase/app-check";

import { AshokaCakraLoader, PageLoader } from "@/shared/components/AshokaCakraLoader";
import { appCheck } from "@/lib/firebase";
import { JaaliHero } from "@/shared/components/MughalJaaliPattern";
import { ScreenErrorBoundary } from "@/shared/components/ScreenErrorBoundary";
import type { PollingBooth } from "@/shared/types/map";

import { useProfileRoute } from "./ProfileRouteContext";
import { PersonalizationStep } from "./login.types";
import { useAuth } from "./useAuth";
import { usePersonalization } from "./usePersonalization";
import { usePhoneOtp } from "./usePhoneOtp";

interface EciLookupResponse {
  constituency: string;
  pollingBooth: PollingBooth;
  wardCode: string;
}

const projectId = import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string;
const isEmulator = import.meta.env["VITE_USE_EMULATORS"] === "true";
const eciLookupUrl = isEmulator
  ? `http://127.0.0.1:5001/${projectId}/us-east1/eciVoterLookup`
  : `https://us-east1-${projectId}.cloudfunctions.net/eciVoterLookup`;

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
    errors,
  } = usePersonalization(user?.uid ?? "");

  const {
    sendOtp,
    verifyOtp,
    isLoading: isOtpLoading,
    isOtpSent,
  } = usePhoneOtp();

  const [voterIdError, setVoterIdError] = useState<string | null>(null);
  const [isVoterIdVerified, setIsVoterIdVerified] = useState(false);
  const [isValidatingVoterId, setIsValidatingVoterId] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const isNameValid = Boolean(formData.name?.trim());
  const isVoterIdValid = Boolean(formData.voterIdNumber?.trim()) && isVoterIdVerified;
  const isPhoneValid = phoneNumber.trim().length > 0;
  const canVerifyOtp = isPhoneValid && otpValue.length >= 6 && !isOtpLoading;
  const canGoNextFromIdentity =
    isNameValid && isVoterIdValid && isPhoneValid && isPhoneVerified;
  const hasElectionInterest = (formData.electionInterest?.length ?? 0) > 0;

  if (isAuthLoading) {
    return <PageLoader />;
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
    if (!voterId || voterId.length < 10) {
      setIsVoterIdVerified(false);
      return;
    }

    setIsValidatingVoterId(true);
    setVoterIdError(null);
    setIsVoterIdVerified(false);
    try {
      const appCheckToken = isEmulator
        ? "emulator-token"
        : appCheck
          ? (await getToken(appCheck)).token
          : "";

      if (!appCheckToken) {
        throw new Error("App Check token missing");
      }

      // Call eciVoterLookup Cloud Function
      // For now, we simulate the fetch as per the mock in the function
      const response = await fetch(eciLookupUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-firebase-appcheck": appCheckToken,
          "x-uid": user.uid,
        },
        body: JSON.stringify({ voterId }),
      });

      if (!response.ok) throw new Error("Lookup failed");

      const data = (await response.json()) as EciLookupResponse;
      updateFormData({
        voterIdNumber: voterId,
        constituency: data.constituency,
        pollingBooth: data.pollingBooth,
      });
      setIsVoterIdVerified(true);
    } catch {
      setIsVoterIdVerified(false);
      setVoterIdError(t("personalization.identity.voter_id_error"));
    } finally {
      setIsValidatingVoterId(false);
    }
  };

  return (
    <ScreenErrorBoundary>
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
          {errors.submit && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                padding: "var(--space-md)",
                background: "var(--lo-l)",
                color: "var(--lo-text)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--lo-tint)",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0 }}>{errors.submit}</p>
              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                style={{
                  marginTop: "var(--space-sm)",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--sf)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {t("common.retry", "Retry")}
              </button>
            </div>
          )}

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
                  <span style={requiredAsteriskStyle}> *</span>
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
                  <span style={requiredAsteriskStyle}> *</span>
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
                {!voterIdError && isVoterIdVerified && (
                  <p
                    role="status"
                    style={{ fontSize: "12px", color: "#1b7f3a" }}
                  >
                    Voter ID verified
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
                  <span style={requiredAsteriskStyle}> *</span>
                </label>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <input
                    type="tel"
                    placeholder={t(
                      "personalization.identity.phone_placeholder",
                    )}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setIsPhoneVerified(false);
                    }}
                    style={{ ...inputStyle, flex: 1 }}
                    id="phone-input"
                  />
                  <button
                    onClick={() => {
                      setIsPhoneVerified(false);
                      void sendOtp(phoneNumber, "recaptcha-container");
                    }}
                    style={buttonSecondaryStyle}
                    disabled={isOtpLoading || !isPhoneValid}
                  >
                    {isOtpLoading ? (
                      <AshokaCakraLoader size={16} />
                    ) : (
                      t("personalization.identity.send_otp")
                    )}
                  </button>
                </div>
                {/* Keep it renderable (not display:none) for Firebase phone auth */}
                <div
                  id="recaptcha-container"
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                />
                {isPhoneVerified && (
                  <p
                    role="status"
                    style={{ fontSize: "12px", color: "#1b7f3a" }}
                  >
                    Phone number verified
                  </p>
                )}
              </div>

              {isOtpSent && !isPhoneVerified && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-xs)",
                  }}
                >
                  <label style={{ font: "var(--text-h2)" }}>
                    {t("personalization.identity.otp_label")}
                    <span style={requiredAsteriskStyle}> *</span>
                  </label>
                  <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => {
                        setOtpValue(e.target.value);
                      }}
                      style={{ ...inputStyle, flex: 1, maxWidth: "220px" }}
                    />
                    <button
                      onClick={() => {
                        void verifyOtp(otpValue).then(() => {
                          setIsPhoneVerified(true);
                        });
                      }}
                      style={{ ...buttonPrimaryStyle, flex: "0 0 auto" }}
                      disabled={!canVerifyOtp}
                    >
                      {t("personalization.identity.verify_otp")}
                    </button>
                  </div>
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
                {t("personalization.skip", "Skip for now")}
              </button>

              <button
                onClick={goNext}
                style={buttonPrimaryStyle}
                disabled={!canGoNextFromIdentity}
              >
                {t("common.next")}
              </button>

              {isEmulator && (
                <button onClick={goNext} style={buttonPrimaryStyle}>
                  Continue (Demo)
                </button>
              )}
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
                  <span style={requiredAsteriskStyle}> *</span>
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
                <button
                  onClick={goNext}
                  style={buttonPrimaryStyle}
                  disabled={!hasElectionInterest}
                >
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
    </ScreenErrorBoundary>
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

const requiredAsteriskStyle = {
  color: "var(--lo)",
  fontWeight: 700,
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
