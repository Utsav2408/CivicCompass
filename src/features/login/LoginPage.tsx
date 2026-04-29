/**
 * LoginPage — Screen 1
 *
 * Accessibility targets:
 *   - Lighthouse accessibility: 100
 *   - All colour pairs: WCAG AA (4.5:1 minimum)
 *   - Keyboard navigable: Tab order logical, focus ring visible
 *   - Screen reader: all interactive elements labelled, live regions set
 *   - Reduced motion: Ashoka Chakra animation respects prefers-reduced-motion
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@features/login/useAuth";
import { AshokaCakraLoader } from "@shared/components/AshokaCakraLoader";
import { JaaliHero } from "@shared/components/MughalJaaliPattern";

function GoogleIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const isHindi = i18n.language === "hi";

  function toggle() {
    void i18n.changeLanguage(isHindi ? "en" : "hi");
  }

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.toggle_aria")}
      aria-pressed={isHindi}  /* screen readers announce "Hindi, toggle button, pressed" */
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        background: "rgba(255,255,255,0.18)",
        border: "1.5px solid rgba(255,255,255,0.5)",
        borderRadius: "var(--radius-full)",
        padding: "6px 4px",
        cursor: "pointer",
        minWidth: "var(--touch-target)",
        minHeight: "var(--touch-target)",
        justifyContent: "center",
      }}
    >
      {/* aria-hidden on spans — the button's own aria-label carries the meaning */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          fontWeight: isHindi ? 400 : 700,
          color: isHindi ? "rgba(255,255,255,0.75)" : "#fff",
          padding: "2px 6px",
          borderRadius: "var(--radius-full)",
          background: isHindi ? "transparent" : "rgba(255,255,255,0.25)",
          transition: "var(--transition-fast)",
        }}
      >
        {t("lang.toggle_en")}
      </span>
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          fontWeight: isHindi ? 700 : 400,
          color: isHindi ? "#fff" : "rgba(255,255,255,0.75)",
          padding: "2px 6px",
          borderRadius: "var(--radius-full)",
          background: isHindi ? "rgba(255,255,255,0.25)" : "transparent",
          transition: "var(--transition-fast)",
        }}
      >
        {t("lang.toggle_hi")}
      </span>
    </button>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const { signIn, isLoading, error, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    void navigate("/home", { replace: true });
    return null;
  }

  async function handleSignIn() {
    await signIn();
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #B84200 0%, #B84200 12%, #FFFFFF 40%, #FFFFFF 60%, #1a5c35 88%, #155230 100%)",
        overflow: "hidden",
      }}
      aria-label="CivicCompass login"
    >
      <JaaliHero />

      {/* Skip link — allows keyboard users to jump past header to main content */}
      <a
        href="#signin-card"
        style={{
          position: "absolute",
          top: "-100%",
          left: "var(--space-md)",
          background: "var(--paper)",
          color: "var(--in)",
          padding: "var(--space-sm) var(--space-md)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          fontWeight: 600,
          zIndex: "var(--z-sos)",
          textDecoration: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = "var(--space-md)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = "-100%";
        }}
      >
        Skip to sign-in
      </a>

      <header
        style={{
          position: "relative",
          zIndex: "var(--z-raised)",
          display: "flex",
          justifyContent: "flex-end",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <LanguageToggle />
      </header>

      <section
        id="signin-card"
        style={{
          position: "relative",
          zIndex: "var(--z-raised)",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-lg)",
        }}
        aria-label="Sign in"
      >
        <div
          style={{
            background: "rgba(255, 252, 247, 0.97)",
            backdropFilter: "blur(12px)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-2xl) var(--space-xl)",
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-md)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Decorative chakra — aria-hidden, screen readers skip it */}
          <AshokaCakraLoader
            size={64}
            color="var(--in)"
            decorative={true}
          />

          <h1
            style={{
              font: "var(--text-h1)",
              color: "var(--in)",           /* 11.40:1 on paper ✅ */
              letterSpacing: "-0.02em",
              textAlign: "center",
              marginTop: "var(--space-xs)",
            }}
          >
            {t("login.wordmark")}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-warm)",    /* 9.94:1 on paper ✅ */
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {t("login.tagline")}
          </p>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-muted)",   /* #856a59 — 4.88:1 on paper ✅ */
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {t("login.tagline_hi_script")}
          </p>

          <div
            style={{
              width: "48px",
              height: "2px",
              background: "linear-gradient(90deg, var(--sf), var(--in))",
              borderRadius: "var(--radius-full)",
              margin: "var(--space-xs) 0",
            }}
            aria-hidden="true"
          />

          {/* Sign in CTA */}
          <button
            onClick={() => void handleSignIn()}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? t("login.cta_loading") : t("login.cta")}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-sm)",
              width: "100%",
              minHeight: "var(--touch-target)",
              padding: "10px var(--space-lg)",
              background: isLoading ? "var(--sf-l)" : "var(--sf)",
              color: "#fff",               /* 5.50:1 on --sf ✅ */
              border: "none",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "var(--transition-base)",
              marginTop: "var(--space-sm)",
              opacity: isLoading ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                // --sf-mid is #a83900 — white text gives 6.46:1 AA ✅
                e.currentTarget.style.background = "var(--sf-mid)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = "var(--sf)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {isLoading ? (
              <AshokaCakraLoader
                size={20}
                color="#fff"
                label={t("login.cta_loading")}
              />
            ) : (
              <GoogleIcon />
            )}
            <span>{isLoading ? t("login.cta_loading") : t("login.cta")}</span>
          </button>

          {/* Error alert — role="alert" + aria-live="assertive" announces immediately */}
          {error && (
            <p
              role="alert"
              aria-live="assertive"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--lo-text)",    /* #ae2f59 — 5.41:1 on lo-light ✅ */
                background: "var(--lo-l)",
                border: "1px solid var(--lo-tint)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-sm) var(--space-md)",
                width: "100%",
                textAlign: "center",
              }}
            >
              {t("login.error_generic")}
            </p>
          )}
        </div>
      </section>

      {/* Footer — full white text for AA compliance on gradient bg */}
      <footer
        style={{
          position: "relative",
          zIndex: "var(--z-raised)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          padding: "var(--space-md) var(--space-lg) var(--space-xl)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "#ffffff",              /* 5.50:1 on saffron, 9.20:1 on green ✅ */
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          {t("login.footer_tagline")}
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "#ffffff",              /* was rgba(255,255,255,0.7) = 2.62:1 ❌ */
          }}
        >
          {t("login.footer_powered")} ·{" "}
          <a
            href="https://eci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("login.footer_eci_label")}
            style={{
              color: "#ffffff",
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-body)",
              fontSize: "11px",
            }}
          >
            {t("login.footer_eci_label")}
          </a>
        </p>
      </footer>
    </main>
  );
}