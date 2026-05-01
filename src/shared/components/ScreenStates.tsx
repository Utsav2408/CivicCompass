import { AshokaCakraLoader } from "./AshokaCakraLoader";
import { LotusEmptyState } from "./LotusMotif";

interface ScreenLoadingStateProps {
  label?: string;
}

export function ScreenLoadingState({
  label = "Loading...",
}: ScreenLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        minHeight: "220px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-xl)",
      }}
    >
      <AshokaCakraLoader size={56} label={label} />
    </div>
  );
}

interface ScreenErrorStateProps {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ScreenErrorState({
  message,
  retryLabel = "Retry",
  onRetry,
}: ScreenErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        padding: "var(--space-lg)",
        background: "var(--lo-l)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--lo-tint)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "var(--lo-text)",
          marginBottom: "var(--space-md)",
        }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={
          onRetry ??
          (() => {
            window.location.reload();
          })
        }
        style={{
          padding: "8px 16px",
          background: "var(--sf)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
        }}
      >
        {retryLabel}
      </button>
    </div>
  );
}

interface ScreenEmptyStateProps {
  title: string;
  message: string;
}

export function ScreenEmptyState({ title, message }: ScreenEmptyStateProps) {
  return (
    <div style={{ padding: "var(--space-md)" }}>
      <LotusEmptyState title={title} message={message} />
    </div>
  );
}
