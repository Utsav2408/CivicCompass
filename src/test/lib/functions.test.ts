import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getFunctions = vi.fn();
const connectFunctionsEmulator = vi.fn();

vi.mock("firebase/functions", () => ({
  getFunctions,
  connectFunctionsEmulator,
}));

vi.mock("@/lib/firebase", () => ({
  default: { app: "mock-app" },
}));

describe("lib/functions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("connects emulator only when env flag is enabled", async () => {
    getFunctions.mockReturnValueOnce({ _tag: "functions-env-check" });

    await import("@/lib/functions");

    if (import.meta.env["VITE_USE_EMULATORS"] === "true") {
      expect(connectFunctionsEmulator).toHaveBeenCalledWith(
        { _tag: "functions-env-check" },
        "127.0.0.1",
        5001,
      );
    } else {
      expect(connectFunctionsEmulator).not.toHaveBeenCalled();
    }
  });

  it("connects emulator when env flag is true", async () => {
    vi.stubEnv("VITE_USE_EMULATORS", "true");
    getFunctions.mockReturnValueOnce({ _tag: "functions-enabled" });

    await import("@/lib/functions");

    expect(connectFunctionsEmulator).toHaveBeenCalledWith(
      { _tag: "functions-enabled" },
      "127.0.0.1",
      5001,
    );
  });

  it("does not connect emulator when env flag is false", async () => {
    vi.stubEnv("VITE_USE_EMULATORS", "false");
    getFunctions.mockReturnValueOnce({ _tag: "functions-disabled" });

    await import("@/lib/functions");

    expect(connectFunctionsEmulator).not.toHaveBeenCalled();
  });

  it("creates functions instance for us-east1", async () => {
    getFunctions.mockReturnValueOnce({ _tag: "functions" });

    const mod = await import("@/lib/functions");

    expect(getFunctions).toHaveBeenCalledWith({ app: "mock-app" }, "us-east1");
    expect(mod.functions).toEqual({ _tag: "functions" });
  });
});
