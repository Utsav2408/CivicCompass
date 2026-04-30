import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGenerate, mockDefineTool, mockZ } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
  mockDefineTool: vi.fn().mockImplementation((config) => ({ ...config, __isTool: true })),
  mockZ: {
    object: vi.fn().mockReturnThis(),
    string: vi.fn().mockReturnThis(),
    enum: vi.fn().mockReturnThis(),
    describe: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnThis(),
    trim: vi.fn().mockReturnThis(),
    url: vi.fn().mockReturnThis(),
  }
}));

vi.mock("genkit", () => ({
  genkit: vi.fn().mockImplementation(() => ({
    generate: mockGenerate,
    defineTool: mockDefineTool,
  })),
  z: mockZ,
}));

const mockModel = vi.fn();
vi.mock("@genkit-ai/google-genai", () => {
  const modelFn = vi.fn();
  const mockPlugin = vi.fn().mockReturnValue({});
  (mockPlugin as any).model = modelFn;
  return {
    googleAI: mockPlugin,
  };
});

// Mock Firebase Admin
const { mockDb, mockDoc } = vi.hoisted(() => ({
  mockDoc: { get: vi.fn(), set: vi.fn(), update: vi.fn(), add: vi.fn() },
  mockDb: { collection: vi.fn() },
}));
mockDb.collection.mockReturnValue({ doc: vi.fn(() => mockDoc), add: vi.fn(() => mockDoc) });

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => mockDb),
  Timestamp: { now: () => ({ seconds: 123, nanoseconds: 0 }) },
}));

// Mock shared utils
vi.mock("../_shared/appCheck.js", () => ({
  verifyAppCheckToken: vi.fn().mockResolvedValue(true),
}));
vi.mock("../_shared/rateLimiter.js", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));
vi.mock("../_shared/secrets.js", () => ({
  getSecret: vi.fn().mockResolvedValue("fake-api-key"),
}));
vi.mock("../_shared/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn() },
}));

import { supportAgentHandler } from "../support-agent.js";

describe("supportAgent Cloud Function", () => {
  let mockRes: any;
  let mockReq: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { checkRateLimit } = await import("../_shared/rateLimiter.js");
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockReq = {
      method: "POST",
      headers: { "x-uid": "test-uid" },
      body: { prompt: "Hello" },
    };
  });

  it("should return AI response on happy path", async () => {
    mockGenerate.mockResolvedValue({ text: "How can I help you?" });

    await supportAgentHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ response: "How can I help you?" });
  });

  it("should return 401 if uid is missing", async () => {
    mockReq.headers = {};
    await supportAgentHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("should return 429 if rate limited", async () => {
    const { checkRateLimit } = await import("../_shared/rateLimiter.js");
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, retryAfter: 60 });

    await supportAgentHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(429);
  });

  it("should return 500 on AI failure", async () => {
    mockGenerate.mockRejectedValue(new Error("AI Down"));

    await supportAgentHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Support agent unavailable" });
  });
});
