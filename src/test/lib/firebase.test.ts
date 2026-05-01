import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initializeApp = vi.fn();
const initializeAppCheck = vi.fn();
const ReCaptchaV3Provider = vi.fn();
const getAuth = vi.fn();
const connectAuthEmulator = vi.fn();
const initializeFirestore = vi.fn();
const persistentLocalCache = vi.fn();
const persistentMultipleTabManager = vi.fn();
const connectFirestoreEmulator = vi.fn();
const getStorage = vi.fn();
const connectStorageEmulator = vi.fn();

vi.mock("firebase/app", () => ({
  initializeApp,
}));

vi.mock("firebase/app-check", () => ({
  initializeAppCheck,
  ReCaptchaV3Provider,
}));

vi.mock("firebase/auth", () => ({
  getAuth,
  connectAuthEmulator,
}));

vi.mock("firebase/firestore", () => ({
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
}));

vi.mock("firebase/storage", () => ({
  getStorage,
  connectStorageEmulator,
}));

describe("lib/firebase", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    const app = { _tag: "app" };
    const auth = { _tag: "auth" };
    const db = { _tag: "db" };
    const storage = { _tag: "storage" };
    const tabManager = { _tag: "tabs" };
    const cache = { _tag: "cache" };
    const appCheck = { _tag: "app-check" };

    initializeApp.mockReturnValue(app);
    getAuth.mockReturnValue(auth);
    initializeFirestore.mockReturnValue(db);
    getStorage.mockReturnValue(storage);
    persistentMultipleTabManager.mockReturnValue(tabManager);
    persistentLocalCache.mockReturnValue(cache);
    ReCaptchaV3Provider.mockImplementation((key: string) => ({ key }));
    initializeAppCheck.mockReturnValue(appCheck);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("initializes firebase app and all core services", async () => {
    const mod = await import("@/lib/firebase");

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(initializeFirestore).toHaveBeenCalledTimes(1);
    expect(getStorage).toHaveBeenCalledTimes(1);
    expect(mod.default).toEqual({ _tag: "app" });
    expect(mod.auth).toEqual({ _tag: "auth" });
    expect(mod.db).toEqual({ _tag: "db" });
    expect(mod.storage).toEqual({ _tag: "storage" });
  });

  it("initializes app check in browser environment", async () => {
    const mod = await import("@/lib/firebase");

    expect(ReCaptchaV3Provider).toHaveBeenCalledTimes(1);
    expect(initializeAppCheck).toHaveBeenCalledTimes(1);
    expect(mod.appCheck).toEqual({ _tag: "app-check" });
  });

  it("connects firebase emulators when env flag is true", async () => {
    vi.stubEnv("VITE_USE_EMULATORS", "true");

    await import("@/lib/firebase");

    expect(connectAuthEmulator).toHaveBeenCalledWith(
      { _tag: "auth" },
      "http://127.0.0.1:9099",
      {
        disableWarnings: true,
      },
    );
    expect(connectFirestoreEmulator).toHaveBeenCalledWith(
      { _tag: "db" },
      "127.0.0.1",
      8080,
    );
    expect(connectStorageEmulator).toHaveBeenCalledWith(
      { _tag: "storage" },
      "127.0.0.1",
      9199,
    );
  });

  it("sets app check debug token on self when configured", async () => {
    vi.stubEnv("VITE_APPCHECK_DEBUG_TOKEN", "debug-token");

    await import("@/lib/firebase");

    expect(
      (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string })
        .FIREBASE_APPCHECK_DEBUG_TOKEN,
    ).toBe("debug-token");
  });

  it("sets app check debug token on global when self is unavailable", async () => {
    vi.stubEnv("VITE_APPCHECK_DEBUG_TOKEN", "global-debug-token");
    vi.stubGlobal("self", undefined);
    vi.stubGlobal("global", {});

    await import("@/lib/firebase");

    expect(
      (globalThis as { global?: { FIREBASE_APPCHECK_DEBUG_TOKEN?: string } })
        .global?.FIREBASE_APPCHECK_DEBUG_TOKEN,
    ).toBe("global-debug-token");
  });

  it("returns null appCheck when document is unavailable", async () => {
    vi.stubGlobal("document", undefined);

    const mod = await import("@/lib/firebase");

    expect(mod.appCheck).toBeNull();
    expect(initializeAppCheck).not.toHaveBeenCalled();
  });
});
