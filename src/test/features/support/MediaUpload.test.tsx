import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MediaUpload } from "@/features/support/components/MediaUpload";

const { uploadBytes, getDownloadURL } = vi.hoisted(() => ({
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
}));
vi.mock("firebase/storage", () => ({
  ref: () => ({ path: "mock" }),
  uploadBytes,
  getDownloadURL,
}));
vi.mock("@/lib/firebase", () => ({ storage: {} }));

describe("MediaUpload", () => {
  it("shows validation error for oversized file", () => {
    const onUploading = vi.fn();
    render(
      <MediaUpload
        ticketId="t1"
        onUploadComplete={vi.fn()}
        onUploading={onUploading}
      />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/less than 10mb/i)).toBeInTheDocument();
  });

  it("uploads valid file and calls onUploadComplete", async () => {
    uploadBytes.mockResolvedValue({ ref: {} });
    getDownloadURL.mockResolvedValue("https://cdn/file.png");
    const onUploadComplete = vi.fn();
    const onUploading = vi.fn();
    render(
      <MediaUpload
        ticketId="t1"
        onUploadComplete={onUploadComplete}
        onUploading={onUploading}
      />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["img"], "ok.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      { expect(onUploadComplete).toHaveBeenCalledWith(
        "https://cdn/file.png",
        "image/png",
      ); },
    );
  });
});
