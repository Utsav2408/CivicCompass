import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MediaUpload } from "@/features/support/components/MediaUpload";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/lib/firebase", () => ({ storage: {} }));
vi.mock("firebase/storage", () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

describe("MediaUpload keyboard branch", () => {
  it("handles Enter/Space key for file picker trigger", () => {
    render(<MediaUpload ticketId="t1" onUploadComplete={vi.fn()} onUploading={vi.fn()} />);
    const picker = screen.getByRole("button");
    fireEvent.keyDown(picker, { key: "Enter" });
    fireEvent.keyDown(picker, { key: " " });
    expect(screen.getByText(/click to upload image or video/i)).toBeInTheDocument();
  });
});
