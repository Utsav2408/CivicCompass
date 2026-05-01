import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initializeApp = vi.fn();
const getApp = vi.fn();
const getApps = vi.fn();
const getAuth = vi.fn();
const connectAuthEmulator = vi.fn();

vi.mock("firebase/app", () => ({
  initializeApp,
  getApp,
  getApps,
}));

vi.mock("firebase/auth", () => ({
  getAuth,
  connectAuthEmulator,
}));

describe("lib/firebaseAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("initializes app when no firebase app exists", async () => {
    const app = { _tag: "new-app" };
    const auth = { _tag: "auth" };
    getApps.mockReturnValue([]);
    initializeApp.mockReturnValue(app);
    getAuth.mockReturnValue(auth);

    const mod = await import("@/lib/firebaseAuth");

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(getApp).not.toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalledWith(app);
    expect(mod.auth).toEqual(auth);
  });

  it("reuses existing app when already initialized", async () => {
    const app = { _tag: "existing-app" };
    const auth = { _tag: "auth" };
    getApps.mockReturnValue([app]);
    getApp.mockReturnValue(app);
    getAuth.mockReturnValue(auth);

    const mod = await import("@/lib/firebaseAuth");

    expect(getApp).toHaveBeenCalledTimes(1);
    expect(initializeApp).not.toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalledWith(app);
    expect(mod.auth).toEqual(auth);
  });

  it("connects auth emulator only when env flag is true", async () => {
    const app = { _tag: "new-app" };
    const auth = { _tag: "auth" };
    getApps.mockReturnValue([]);
    initializeApp.mockReturnValue(app);
    getAuth.mockReturnValue(auth);
    vi.stubEnv("VITE_USE_EMULATORS", "true");

    await import("@/lib/firebaseAuth");

    expect(connectAuthEmulator).toHaveBeenCalledWith(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  });
});
