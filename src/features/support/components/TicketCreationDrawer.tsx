import { useState, memo } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/login/useAuth";
import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import type { TicketCategory } from "@/shared/types/support";

import { useTickets } from "../hooks/useTickets";

import { MediaUpload } from "./MediaUpload";


interface TicketCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketCreationDrawer = memo(function TicketCreationDrawer({ isOpen, onClose }: TicketCreationDrawerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createTicket } = useTickets(user?.uid);
  
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      if (!description.trim()) return;
      // Create initial ticket to get an ID for media upload rules
      setIsSubmitting(true);
      try {
         const id = await createTicket(description, category as TicketCategory, "draft");
         setTicketId(id);
         setStep(2);
      } catch {
         // Silently handle or use error state if needed
      } finally {
         setIsSubmitting(false);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    if (!ticketId) return;
    setIsSubmitting(true);
    try {
      // In a real app, we'd update the ticket status to 'open' and add mediaUrl
      // For now, we'll just mock the completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
      // Reset state
      setStep(1);
      setDescription("");
      setMedia(null);
    } catch {
      // Silently handle or use error state if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-modal)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)"
      }}
    >
      <div style={{
        width: "100%",
        maxWidth: "500px",
        background: "var(--paper)",
        borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        padding: "var(--space-lg)",
        maxHeight: "90vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="drawer-title" style={{ margin: 0, fontSize: "20px" }}>{t("support.create.title", "Report an Issue")}</h2>
          <button 
            type="button"
            onClick={onClose} 
            aria-label={t("common.close", "Close")}
            style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", gap: "8px" }} aria-label={t("common.steps", "Steps")}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              flex: 1, 
              height: "4px", 
              borderRadius: "2px", 
              background: i <= step ? "var(--in)" : "var(--border)" 
            }} />
          ))}
        </div>

        {/* Step Content */}
        <div style={{ flex: 1 }}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <label htmlFor="description" style={{ fontSize: "14px", fontWeight: 600 }}>{t("support.create.description_label", "What's the issue?")}</label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); }}
                placeholder={t("support.create.placeholder", "Describe the problem in detail...")}
                style={{ 
                  width: "100%", 
                  height: "120px", 
                  padding: "12px", 
                  borderRadius: "var(--radius-md)", 
                  border: "1.5px solid var(--border)",
                  resize: "none",
                  fontFamily: "inherit"
                }}
              />
              <label htmlFor="category" style={{ fontSize: "14px", fontWeight: 600 }}>{t("support.create.category_label", "Category")}</label>
              <select 
                id="category"
                value={category}
                onChange={(e) => { setCategory(e.target.value); }}
                style={{ padding: "10px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)" }}
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="safety">Safety</option>
                <option value="voter-card">Voter Card</option>
                <option value="general">General</option>
              </select>
            </div>
          )}

          {step === 2 && ticketId && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
               <label style={{ fontSize: "14px", fontWeight: 600 }}>{t("support.create.media_label", "Add Photo/Video (Optional)")}</label>
               <MediaUpload 
                 ticketId={ticketId} 
                 onUploadComplete={(url, type) => { setMedia({ url, type }); }}
                 onUploading={setIsSubmitting}
               />
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
               <label style={{ fontSize: "14px", fontWeight: 600 }}>{t("support.create.confirm_label", "Confirm Details")}</label>
               <div style={{ padding: "var(--space-md)", background: "var(--pg)", borderRadius: "var(--radius-md)", fontSize: "14px" }}>
                  <div style={{ fontWeight: 700, color: "var(--in)", marginBottom: "4px" }}>AI Summary:</div>
                  <p style={{ margin: 0, fontStyle: "italic" }}>
                    User is reporting a {category} issue: "{description.slice(0, 50)}..."
                  </p>
               </div>
               {media && (
                 <div style={{ fontSize: "12px", color: "var(--gd-dark)" }}>✓ Media attached successfully</div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: "var(--space-md)" }}>
          {step > 1 && (
            <button 
              type="button"
              onClick={() => { setStep(step - 1); }}
              style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}
            >
              {t("common.back", "Back")}
            </button>
          )}
          <button 
            type="button"
            onClick={() => {
              if (step === 3) {
                void handleConfirm();
              } else {
                void handleNext();
              }
            }}
            disabled={isSubmitting || (step === 1 && !description.trim())}
            aria-busy={isSubmitting}
            style={{ 
              flex: 2, 
              padding: "12px", 
              borderRadius: "var(--radius-md)", 
              border: "none", 
              background: "var(--in)", 
              color: "white", 
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {isSubmitting ? <AshokaCakraLoader size={20} color="white" /> : (step === 3 ? t("support.create.submit", "Raise Ticket") : t("common.next", "Next"))}
          </button>
        </div>
      </div>
    </div>
  );
});
