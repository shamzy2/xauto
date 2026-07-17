export const RECEIPT_MAX_BYTES = 8 * 1024 * 1024;

export const RECEIPT_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

export const RECEIPT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.pdf";

export function validateReceiptFile(file: File): string | null {
  if (!(file instanceof File) || file.size <= 0) {
    return null;
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return "Filen er for stor (maks 8 MB).";
  }
  const type = file.type || "";
  if (type && !RECEIPT_ALLOWED_MIME_TYPES.has(type)) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf")) {
      return "Bare bilder (JPG, PNG, WebP) og PDF er tillatt.";
    }
  }
  return null;
}
