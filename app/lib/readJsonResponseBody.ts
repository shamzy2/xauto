import { SUBMISSION_UPLOAD_TOO_LARGE_MESSAGE } from "@/lib/submissionUploadLimits";

/**
 * Leser fetch-svar som JSON. Unngår `res.json()` på tomt svar (SyntaxError:
 * «Unexpected end of JSON input») når proxy/502 returnerer uten body.
 * Håndterer 413 / «Request Entity Too Large» (Vercel/plain text, ikke JSON).
 */
export async function readJsonResponseBody<T = unknown>(res: Response): Promise<T> {
  const raw = await res.text();
  const trimmed = raw.trim();

  if (res.status === 413) {
    throw new Error(SUBMISSION_UPLOAD_TOO_LARGE_MESSAGE);
  }

  const head = trimmed.slice(0, 96).toLowerCase();
  if (
    head.includes("request entity too large") ||
    head.includes("payload too large") ||
    head.includes("function payload too large")
  ) {
    throw new Error(SUBMISSION_UPLOAD_TOO_LARGE_MESSAGE);
  }

  if (!trimmed) {
    if (res.status >= 500) {
      throw new Error(
        "Serverfeil, tomt svar. Sjekk regnr. (ordinært skilt) og prøv igjen.",
      );
    }
    throw new Error(`Tomt svar fra server (${res.status}).`);
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error("Kunne ikke lese svaret fra serveren. Prøv igjen om litt.");
  }
}
