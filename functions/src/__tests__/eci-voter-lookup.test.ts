import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockDb, mockDoc, mockCollection } = vi.hoisted(() => ({
  mockDoc: {
    get: vi.fn(),
    set: vi.fn(),
  },
  mockCollection: {
    doc: vi.fn(),
  },
  mockDb: {
    collection: vi.fn(),
  },
}));

// Link them
mockCollection.doc.mockReturnValue(mockDoc);
mockDb.collection.mockReturnValue(mockCollection);

// Mock Firestore separately to handle top-level getFirestore()
vi.mock("firebase-admin/firestore", () => {
  return {
    getFirestore: vi.fn(() => mockDb),
    Timestamp: { now: () => ({ seconds: 123, nanoseconds: 0 }) },
  };
});

// Mock Firebase Admin
vi.mock("firebase-admin", () => ({
  initializeApp: vi.fn(),
  credential: { cert: vi.fn() },
}));

// Mock shared utils
vi.mock("../_shared/appCheck.js", () => ({
  verifyAppCheckToken: vi.fn().mockResolvedValue(true),
}));
vi.mock("../_shared/rateLimiter.js", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));
vi.mock("../_shared/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn() },
}));

// Mock the voter schema
vi.mock("../_shared/schemas.js", () => ({
  VoterIdSchema: {
    safeParse: (val: string) => {
      if (val === "INVALID")
        return { success: false, error: { flatten: () => "Invalid ID" } };
      return { success: true, data: val };
    },
  },
}));

import { getFirestore } from "firebase-admin/firestore";
import { eciVoterLookupHandler } from "../eci-voter-lookup.js";

describe("eciVoterLookup Cloud Function", () => {
  let mockRes: any;
  let mockReq: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-link for safety
    mockCollection.doc.mockReturnValue(mockDoc);
    mockDb.collection.mockReturnValue(mockCollection);

    const { checkRateLimit } = await import("../_shared/rateLimiter.js");
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });

    mockRes = {
      set: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockReq = {
      method: "POST",
      headers: { "x-uid": "test-uid" },
      body: { voterId: "ABC1234567" },
    };
  });

  it("should return 405 if method is not POST", async () => {
    mockReq.method = "GET";
    await eciVoterLookupHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  it("should handle CORS preflight OPTIONS", async () => {
    mockReq.method = "OPTIONS";
    await eciVoterLookupHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.send).toHaveBeenCalledWith("");
  });

  it("should return 401 if x-uid is missing", async () => {
    mockReq.headers = {};
    await eciVoterLookupHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("should return 429 if rate limit exceeded", async () => {
    const { checkRateLimit } = await import("../_shared/rateLimiter.js");
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      retryAfter: "3600",
    });

    await eciVoterLookupHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Rate limit exceeded" }),
    );
  });

  it("should return 400 for invalid voter ID format", async () => {
    mockReq.body.voterId = "INVALID";
    await eciVoterLookupHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("should return 200 and cached data if present in Firestore", async () => {
    const db = getFirestore();
    const docRef = db.collection("voterCache").doc("ABC1234567");
    vi.mocked(docRef.get).mockResolvedValue({
      exists: true,
      data: () => ({ constituency: "Cached" }),
    } as any);

    await eciVoterLookupHandler(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ constituency: "Cached" });
  });

  it("should return 200 and mock data if not cached, then cache it", async () => {
    const db = getFirestore();
    const docRef = db.collection("voterCache").doc("ABC1234567");
    vi.mocked(docRef.get).mockResolvedValue({ exists: false } as any);

    await eciVoterLookupHandler(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(docRef.set).toHaveBeenCalled(); // Should cache the result
    expect(db.collection("users").doc("test-uid").set).toHaveBeenCalled(); // Should update user profile
  });

  it("should return 500 if Firestore fails", async () => {
    const db = getFirestore();
    // Override the mockDb.collection behavior just for this test
    vi.mocked(db.collection).mockImplementation(() => {
      throw new Error("Firestore down");
    });

    await eciVoterLookupHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "ECI lookup failed" });
  });

  it("should fail if App Check is invalid", async () => {
    const { verifyAppCheckToken } = await import("../_shared/appCheck.js");
    vi.mocked(verifyAppCheckToken).mockResolvedValue(false);

    await eciVoterLookupHandler(mockReq as any, mockRes as any);
    expect(verifyAppCheckToken).toHaveBeenCalled();
  });
});
