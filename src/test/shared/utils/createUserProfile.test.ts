import { describe, expect, it, vi } from "vitest";

const doc = vi.fn();
const setDoc = vi.fn();
const serverTimestamp = vi.fn(() => "server-ts");

vi.mock("firebase/firestore", () => ({
  doc,
  setDoc,
  serverTimestamp,
}));

vi.mock("@/lib/firebase", () => ({
  db: { _tag: "db" },
}));

describe("createUserProfile", () => {
  it("writes merged defaults and user fields to firestore", async () => {
    doc.mockReturnValueOnce("user-ref");

    const { createUserProfile } =
      await import("@/shared/utils/createUserProfile");

    await createUserProfile("uid-1", {
      name: "Utsav",
      language: "hi",
      electionInterest: ["local-issues"],
    });

    expect(doc).toHaveBeenCalledWith({ _tag: "db" }, "users", "uid-1");
    expect(setDoc).toHaveBeenCalledWith(
      "user-ref",
      expect.objectContaining({
        uid: "uid-1",
        name: "Utsav",
        language: "hi",
        electionInterest: ["local-issues"],
        isComplete: false,
        createdAt: "server-ts",
        updatedAt: "server-ts",
      }),
      { merge: true },
    );
  });
});
