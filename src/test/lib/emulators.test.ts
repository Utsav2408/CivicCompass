import { describe, expect, it, vi } from "vitest";

const connectAuthEmulator = vi.fn();
const connectFirestoreEmulator = vi.fn();
const connectStorageEmulator = vi.fn();

vi.mock("firebase/auth", () => ({
  connectAuthEmulator,
}));

vi.mock("firebase/firestore", () => ({
  connectFirestoreEmulator,
}));

vi.mock("firebase/storage", () => ({
  connectStorageEmulator,
}));

vi.mock("@/lib/firebase", () => ({
  auth: { _tag: "auth" },
  db: { _tag: "db" },
  storage: { _tag: "storage" },
}));

describe("connectToEmulators", () => {
  it("connects auth, firestore and storage emulators", async () => {
    const { connectToEmulators } = await import("@/lib/emulators");

    connectToEmulators();

    expect(connectAuthEmulator).toHaveBeenCalledWith(
      { _tag: "auth" },
      "http://127.0.0.1:9099",
      { disableWarnings: false },
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
});
