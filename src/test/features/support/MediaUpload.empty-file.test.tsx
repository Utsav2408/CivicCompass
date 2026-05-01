import { fireEvent, render } from "@testing-library/react";
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

describe("MediaUpload empty file branch", () => {
  it("returns early when no file selected", () => {
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
    fireEvent.change(input, { target: { files: [] } });
    expect(onUploading).not.toHaveBeenCalled();
    expect(uploadBytes).not.toHaveBeenCalled();
    expect(getDownloadURL).not.toHaveBeenCalled();
  });
});
