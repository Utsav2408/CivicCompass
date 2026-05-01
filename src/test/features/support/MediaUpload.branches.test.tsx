import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MediaUpload } from "@/features/support/components/MediaUpload";

const { uploadBytes, getDownloadURL } = vi.hoisted(() => ({
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));
vi.mock("firebase/storage", () => ({
  ref: () => ({ path: "mock" }),
  uploadBytes,
  getDownloadURL,
}));
vi.mock("@/lib/firebase", () => ({ storage: {} }));

describe("MediaUpload branches", () => {
  it("shows invalid file type error for unsupported type", () => {
    render(
      <MediaUpload
        ticketId="t1"
        onUploadComplete={vi.fn()}
        onUploading={vi.fn()}
      />,
    );
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["abc"], "doc.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(
      screen.getByText(/only images and videos are allowed/i),
    ).toBeInTheDocument();
  });

  it("shows upload failed on storage error", async () => {
    uploadBytes.mockRejectedValue(new Error("upload broke"));
    const onUploading = vi.fn();
    render(
      <MediaUpload
        ticketId="t1"
        onUploadComplete={vi.fn()}
        onUploading={onUploading}
      />,
    );
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["img"], "ok.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/failed to upload media/i)).toBeInTheDocument();
    });
  });
});
