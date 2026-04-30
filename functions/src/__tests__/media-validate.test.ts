import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockDb, mockDoc, mockCollection, mockStorage, mockBucket, mockFile } = vi.hoisted(() => ({
  mockDoc: {
    get: vi.fn(),
    update: vi.fn(),
  },
  mockCollection: {
    doc: vi.fn(),
  },
  mockDb: {
    collection: vi.fn(),
  },
  mockFile: {
    delete: vi.fn(),
  },
  mockBucket: {
    file: vi.fn(),
  },
  mockStorage: {
    bucket: vi.fn(),
  },
}));

mockCollection.doc.mockReturnValue(mockDoc);
mockDb.collection.mockReturnValue(mockCollection);
mockBucket.file.mockReturnValue(mockFile);
mockStorage.bucket.mockReturnValue(mockBucket);

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => mockDb),
  Timestamp: { now: () => ({ seconds: 123, nanoseconds: 0 }) },
}));

vi.mock("firebase-admin/storage", () => ({
  getStorage: vi.fn(() => mockStorage),
}));

vi.mock("../_shared/rateLimiter.js", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("../_shared/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { mediaValidate } from "../media-validate.js";

describe("mediaValidate Cloud Function", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { checkRateLimit } = await import("../_shared/rateLimiter.js");
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    
    mockCollection.doc.mockReturnValue(mockDoc);
    mockDb.collection.mockReturnValue(mockCollection);
    mockBucket.file.mockReturnValue(mockFile);
    mockStorage.bucket.mockReturnValue(mockBucket);
  });

  it("should delete file and update ticket if rate limit exceeded", async () => {
    const { checkRateLimit } = await import("../_shared/rateLimiter.js");
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false });
    
    vi.mocked(mockDoc.get).mockResolvedValue({
      exists: true,
      data: () => ({ userId: "test-user" }),
    } as any);

    const event = {
      data: {
        name: "tickets/ticket-123/media/image.jpg",
        contentType: "image/jpeg",
        size: "1024",
      },
    };

    await (mediaValidate as any)(event);

    expect(mockFile.delete).toHaveBeenCalled();
    expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
      mediaError: expect.stringContaining("limit reached"),
    }));
  });

  it("should accept valid JPEG under 10MB", async () => {
    vi.mocked(mockDoc.get).mockResolvedValue({
      exists: true,
      data: () => ({ userId: "test-user" }),
    } as any);

    const event = {
      data: {
        name: "tickets/ticket-123/media/photo.jpg",
        contentType: "image/jpeg",
        size: "5000000", // 5MB
      },
    };

    await (mediaValidate as any)(event);

    expect(mockFile.delete).not.toHaveBeenCalled();
    expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
      mediaUrl: expect.stringContaining("photo.jpg"),
    }));
  });

  it("should reject and delete oversized file (>10MB)", async () => {
    vi.mocked(mockDoc.get).mockResolvedValue({
      exists: true,
      data: () => ({ userId: "test-user" }),
    } as any);

    const event = {
      data: {
        name: "tickets/ticket-123/media/large.mp4",
        contentType: "video/mp4",
        size: "15000000", // 15MB
      },
    };

    await (mediaValidate as any)(event);

    expect(mockFile.delete).toHaveBeenCalled();
    expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
      mediaError: expect.stringContaining("File too large"),
    }));
  });

  it("should reject and delete invalid file type (PDF)", async () => {
    vi.mocked(mockDoc.get).mockResolvedValue({
      exists: true,
      data: () => ({ userId: "test-user" }),
    } as any);

    const event = {
      data: {
        name: "tickets/ticket-123/media/doc.pdf",
        contentType: "application/pdf",
        size: "1024",
      },
    };

    await (mediaValidate as any)(event);

    expect(mockFile.delete).toHaveBeenCalled();
    expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
      mediaError: expect.stringContaining("Invalid file type"),
    }));
  });
});
