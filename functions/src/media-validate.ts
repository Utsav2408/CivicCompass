import { onObjectFinalized } from "firebase-functions/v2/storage";
import { getStorage } from "firebase-admin/storage";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { log } from "./_shared/logger.js";
import { checkRateLimit } from "./_shared/rateLimiter.js";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates uploaded ticket media files.
 * Rejects invalid MIME types and oversized files.
 * Triggered automatically when a file is uploaded to Storage.
 */
export const mediaValidate = onObjectFinalized(
  {
    bucket: "civiccompass-494517.firebasestorage.app",
    region: "us-east1",
  },
  async (event) => {
    const object = event.data;
    const filePath = object.name ?? "";
    const contentType = object.contentType ?? "";
    const fileSize = Number(object.size ?? "0");

    // Only process ticket media uploads
    if (!filePath.startsWith("tickets/")) {
      return;
    }

    // Extract ticketId from path: tickets/{ticketId}/media/{filename}
    const pathParts = filePath.split("/");
    const ticketId = pathParts[1];

    log.info("media_upload_received", {
      ticketId: ticketId ?? "unknown",
      contentType,
      sizeBytes: fileSize,
    });

    if (!ticketId) return;

    const ticketDoc = await getFirestore()
      .collection("tickets")
      .doc(ticketId)
      .get();
    const userId = ticketDoc.data()?.userId;

    if (!userId) {
      log.error("media_validation_no_user", { ticketId });
      await getStorage().bucket().file(filePath).delete();
      return;
    }

    // Rate limit — 10 uploads per user per day
    const rateLimit = await checkRateLimit({
      uid: userId,
      functionName: "ticket-media-upload",
      maxCalls: 10,
      windowMs: 24 * 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      await getStorage().bucket().file(filePath).delete();
      await getFirestore().collection("tickets").doc(ticketId).update({
        mediaError: "Upload limit reached. Maximum 10 uploads per day.",
        mediaErrorAt: Timestamp.now(),
      });
      log.warn("media_upload_rate_limit_exceeded", { userId, ticketId });
      return;
    }

    const isValidType = ALLOWED_MIME_TYPES.includes(contentType);
    const isValidSize = fileSize <= MAX_SIZE_BYTES;

    if (!isValidType || !isValidSize) {
      // Delete the invalid file
      await getStorage().bucket().file(filePath).delete();

      // Write error to Firestore ticket doc
      if (ticketId) {
        await getFirestore()
          .collection("tickets")
          .doc(ticketId)
          .update({
            mediaError: !isValidType
              ? "Invalid file type. Only JPEG, PNG, WebP, and MP4 allowed."
              : "File too large. Maximum size is 10MB.",
            mediaErrorAt: Timestamp.now(),
          });
      }

      log.warn("media_validation_failed", {
        ticketId: ticketId ?? "unknown",
        contentType,
        sizeBytes: fileSize,
        reason: !isValidType ? "invalid_type" : "size_exceeded",
      });

      return;
    }

    // Valid file — update ticket with media URL
    if (ticketId) {
      const mediaUrl = `https://storage.googleapis.com/civiccompass-494517.firebasestorage.app/${filePath}`;
      await getFirestore().collection("tickets").doc(ticketId).update({
        mediaUrl,
        mediaValidatedAt: Timestamp.now(),
      });
    }

    log.info("media_validation_success", {
      ticketId: ticketId ?? "unknown",
      sizeBytes: fileSize,
    });
  },
);
