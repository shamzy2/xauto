/**
 * Vercel serverless request bodies are capped (~4.5 MB including multipart
 * boundaries). Photos are JPEG-compressed in the browser first (typical iPhone
 * shots), then must stay within these caps.
 */
export const SUBMISSION_MAX_PHOTOS_COUNT = 20;

/** Total bytes for all photos after client compression + FormData JSON fields. */
export const SUBMISSION_MAX_PHOTOS_TOTAL_BYTES = Math.floor(4 * 1024 * 1024);

/** Fallback cap per file if compression failed or exotic format. */
export const SUBMISSION_MAX_PHOTO_EACH_BYTES = Math.floor(1.5 * 1024 * 1024);

export const SUBMISSION_UPLOAD_TOO_LARGE_MESSAGE =
  "Bildene er for store til sammen (maks ca. 4 MB totalt). Ta bort noen bilder — vanlige iPhone-bilder komprimeres automatisk før sending.";

export const SUBMISSION_PER_PHOTO_TOO_LARGE_MESSAGE =
  "Ett eller flere bilder er for store (hvert bilde må være under ca. 1,5 MB etter komprimering).";

export function validateSubmissionPhotoSizes(
  files: readonly { size: number }[],
): string | null {
  if (files.length > SUBMISSION_MAX_PHOTOS_COUNT) {
    return `Maks ${SUBMISSION_MAX_PHOTOS_COUNT} bilder.`;
  }
  let total = 0;
  for (const f of files) {
    if (f.size > SUBMISSION_MAX_PHOTO_EACH_BYTES) {
      return SUBMISSION_PER_PHOTO_TOO_LARGE_MESSAGE;
    }
    total += f.size;
  }
  if (total > SUBMISSION_MAX_PHOTOS_TOTAL_BYTES) {
    return SUBMISSION_UPLOAD_TOO_LARGE_MESSAGE;
  }
  return null;
}
