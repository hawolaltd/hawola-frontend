export const MAX_PROOF_BYTES = 1 * 1024 * 1024;

export const PROOF_FILE_ACCEPT =
  ".jpg,.jpeg,.png,.pdf,.heic,.heif,.doc,.docx,image/jpeg,image/png,image/heic,image/heif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".heic", ".heif", ".doc", ".docx"];

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function validateProofFile(file: File | null | undefined): string | null {
  if (!file) return "Choose a file to upload.";
  if (file.size <= 0) return "Empty file.";
  if (file.size > MAX_PROOF_BYTES) return "Proof file must be 1 MB or smaller.";

  const name = file.name.toLowerCase();
  if (ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return null;
  }
  const mime = (file.type || "").split(";")[0].trim().toLowerCase();
  if (mime && ALLOWED_MIME.has(mime)) {
    return null;
  }
  return "Use JPG, PNG, HEIC, PDF, or Word (.doc, .docx) — max 1 MB.";
}

export const PROOF_FILE_HINT =
  "JPG, PNG, HEIC, PDF, or Word · max 1 MB";
