import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState, useRef, memo } from "react";
import { useTranslation } from "react-i18next";

import { storage } from "@/lib/firebase";

interface MediaUploadProps {
  ticketId: string;
  onUploadComplete: (url: string, type: string) => void;
  onUploading: (isUploading: boolean) => void;
}

export const MediaUpload = memo(function MediaUpload({ ticketId, onUploadComplete, onUploading }: MediaUploadProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 10 * 1024 * 1024) {
      setError(t("support.media.too_large", "File size must be less than 10MB"));
      return;
    }

    if (!file.type.match("image/.*|video/.*")) {
      setError(t("support.media.invalid_type", "Only images and videos are allowed"));
      return;
    }

    setError(null);
    onUploading(true);

    try {
      // Local preview
      const reader = new FileReader();
      reader.onload = (prev) => { setPreview(prev.target?.result as string); };
      reader.readAsDataURL(file);

      // Upload to Storage
      const storageRef = ref(storage, `tickets/${ticketId}/media/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      onUploadComplete(url, file.type);
    } catch {
      setError(t("support.media.upload_failed", "Failed to upload media"));
    } finally {
      onUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div 
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        style={{
          width: "100%",
          height: "150px",
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: "var(--pg)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {preview ? (
           <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <span style={{ fontSize: "32px" }}>📸</span>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>
              {t("support.media.click_to_upload", "Click to upload image or video")}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Max 10MB
            </span>
          </>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => { void handleFileChange(e); }} 
        accept="image/*,video/*" 
        style={{ display: "none" }} 
      />

      {error && (
        <div style={{ fontSize: "12px", color: "var(--lo)", textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
});
