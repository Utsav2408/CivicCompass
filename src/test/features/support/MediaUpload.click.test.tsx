import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MediaUpload } from "@/features/support/components/MediaUpload";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("firebase/storage", () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));
vi.mock("@/lib/firebase", () => ({ storage: {} }));

describe("MediaUpload click path", () => {
  it("opens file picker on dropzone click", () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => {});
    render(<MediaUpload ticketId="t1" onUploadComplete={vi.fn()} onUploading={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
