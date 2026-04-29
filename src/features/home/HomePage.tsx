/**
 * HomePage — Screen 2 (stub)
 *
 * Placeholder rendered after successful login.
 * Confirms the auth → redirect → protected route flow works end-to-end.
 * Full implementation covers countdown timer, election timeline,
 * and quick-action grid — built in the next sprint.
 */

import { useAuth } from "@features/login/useAuth";

export function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        background: "var(--color-bg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <h1
        style={{
          font: "var(--text-h1)",
          color: "var(--in)",
        }}
      >
        CivicCompass
      </h1>

      {user && (
        <p style={{ color: "var(--text-warm)", fontSize: "14px" }}>
          Welcome, {user.displayName ?? user.email}
        </p>
      )}

      {/* Temporary sign-out — lets us verify the full auth cycle in testing */}
      <button
        onClick={() => void signOut()}
        style={{
          marginTop: "var(--space-sm)",
          padding: "8px var(--space-md)",
          background: "transparent",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--text-warm)",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </main>
  );
}