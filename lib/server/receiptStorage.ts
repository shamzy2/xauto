import "server-only";

import { randomUUID } from "crypto";

import { validateReceiptFile } from "@/lib/receiptUploadLimits";
import { createSupabaseAdmin } from "@/lib/server/supabaseAdmin";

export const ACCOUNTING_RECEIPTS_BUCKET = "accounting-receipts";

export type ReceiptScope = "car" | "general";

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
  return base || "kvittering";
}

export async function uploadAccountingReceipt(
  scope: ReceiptScope,
  costId: string,
  file: File,
): Promise<string> {
  const validationError = validateReceiptFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const admin = createSupabaseAdmin();
  const safeName = sanitizeFilename(file.name);
  const objectPath = `${scope}/${costId}/${randomUUID()}-${safeName}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const contentType =
    file.type ||
    (file.name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "application/octet-stream");

  const { error } = await admin.storage
    .from(ACCOUNTING_RECEIPTS_BUCKET)
    .upload(objectPath, buf, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error("Kunne ikke laste opp kvittering.");
  }

  return objectPath;
}

export async function getReceiptSignedUrl(
  storagePath: string,
  expiresInSeconds = 7200,
): Promise<string | null> {
  if (!storagePath.trim()) return null;
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.storage
    .from(ACCOUNTING_RECEIPTS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
