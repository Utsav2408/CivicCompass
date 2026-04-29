import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ScreenErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // We log it to the monitoring service in a real app
    // eslint-disable-next-line no-console
    console.error("ScreenErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: "var(--space-xl)",
              textAlign: "center",
              background: "var(--lo-l)",
              borderRadius: "var(--radius-lg)",
              margin: "var(--space-lg)",
              border: "1px solid var(--lo-tint)",
            }}
          >
            <h2 style={{ color: "var(--lo)", marginBottom: "var(--space-sm)" }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: "14px", color: "var(--lo-text)", marginBottom: "var(--space-md)" }}>
              {this.state.error?.message}
            </p>
            <button
              onClick={() => { window.location.reload(); }}
              style={{
                padding: "8px 16px",
                background: "var(--sf)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
