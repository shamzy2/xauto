import "server-only";

import sharp from "sharp";

import type { PdfImagePart } from "./sellSubmissionPdf";

const MAX_EDGE_PX = 2048;
const JPEG_QUALITY = 82;
/** Fallback innbygging uten resize — kun små filer for å unngå minne-/timeout-problemer. */
const FALLBACK_MAX_BYTES = 6 * 1024 * 1024;

/**
 * Gjør bilder PDF-vennlige: roter EXIF, nedskaler lange kanter, JPEG med mozjpeg.
 * Store originale (f.eks. 100 MB) blir dermed håndterbare for jsPDF og Vercel.
 */
export async function bufferToPdfImagePart(
  buf: Buffer,
  contentType: string,
): Promise<PdfImagePart | null> {
  if (!buf.length) return null;

  try {
    let pipeline = sharp(buf, { failOn: "none" }).rotate();
    const meta = await pipeline.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (
      w > MAX_EDGE_PX ||
      h > MAX_EDGE_PX ||
      (meta.format === "heif" || meta.format === "gif")
    ) {
      pipeline = pipeline.resize(MAX_EDGE_PX, MAX_EDGE_PX, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    const jpeg = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    return { base64: jpeg.toString("base64"), format: "JPEG" };
  } catch {
    if (buf.length > FALLBACK_MAX_BYTES) return null;
    const format: PdfImagePart["format"] = contentType.includes("png")
      ? "PNG"
      : "JPEG";
    return { base64: buf.toString("base64"), format };
  }
}
