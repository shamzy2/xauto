/**
 * Resize + JPEG-compress phone photos so several iPhone-style images fit under
 * Vercel's single-request body limit, while staying sharp enough for car/skadefoto.
 */

const MAX_LONG_EDGE_PX = 2400;
const MIME = "image/jpeg";

function jpegBlobFromCanvas(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), MIME, quality);
  });
}

/**
 * One full-resolution iPhone photo (HEIC/JPEG) → web-friendly JPEG.
 * Falls back to original file if decoding fails (e.g. HEIC on some browsers).
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const { width, height } = bitmap;
    const longEdge = Math.max(width, height);
    const scale =
      longEdge <= MAX_LONG_EDGE_PX ? 1 : MAX_LONG_EDGE_PX / longEdge;
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);

    let quality = 0.85;
    let blob: Blob | null = await jpegBlobFromCanvas(canvas, quality);
    /** Target ~0.5–0.9 MB per image so several fit in one request. */
    const targetBytes = 850 * 1024;
    while (blob && blob.size > targetBytes && quality > 0.52) {
      quality -= 0.06;
      blob = await jpegBlobFromCanvas(canvas, quality);
    }

    if (!blob || blob.size <= 0) {
      return file;
    }

    const stripped = file.name.replace(/\.[^.]+$/i, "");
    const base =
      stripped.replace(/[^\wæøåÆØÅ\-]+/g, "_").slice(0, 60) || "bilde";
    return new File([blob], `${base}.jpg`, {
      type: MIME,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

export async function compressImagesForUpload(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageForUpload(f)));
}
