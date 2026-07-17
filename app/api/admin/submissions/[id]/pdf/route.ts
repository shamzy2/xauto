import { NextResponse } from "next/server";

import type { AdminSubmissionRow } from "@/lib/server/adminSubmissionFormatting";
import { bufferToPdfImagePart } from "@/lib/server/downscaleImageForPdf";
import {
  buildSellSubmissionPdf,
  type PdfImagePart,
} from "@/lib/server/sellSubmissionPdf";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/server/supabaseAdmin";

export const runtime = "nodejs";

/** Lengre kjøring når mange/store bilder skal nedskaleres (Vercel Pro+). */
export const maxDuration = 120;

const FETCH_CONCURRENCY = 4;
const SIGN_URL_SEC = 600;

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const chunk = await Promise.all(
      batch.map((item, j) => fn(item, i + j)),
    );
    out.push(...chunk);
  }
  return out;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }

  const { data: sellRow, error: sellErr } = await supabase
    .from("sell_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (sellErr) {
    return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
  }

  let row = sellRow as AdminSubmissionRow | null;

  if (!row) {
    const { data: innRow, error: innErr } = await supabase
      .from("innbytte_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (innErr || !innRow) {
      return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
    }
    row = innRow as AdminSubmissionRow;
  }

  const r = row;
  const paths = (r.photo_paths ?? []).filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );

  const images: PdfImagePart[] = [];

  try {
    const admin = createSupabaseAdmin();
    const signedUrls = await Promise.all(
      paths.map((path) =>
        admin.storage
          .from("sell-submission-photos")
          .createSignedUrl(path, SIGN_URL_SEC)
          .then((res) => res.data?.signedUrl ?? null),
      ),
    );

    const parts = await mapInBatches(
      signedUrls,
      FETCH_CONCURRENCY,
      async (url) => {
        if (!url) return null;
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const buf = Buffer.from(await res.arrayBuffer());
          const ct = res.headers.get("content-type") ?? "application/octet-stream";
          return await bufferToPdfImagePart(buf, ct);
        } catch {
          return null;
        }
      },
    );

    for (const p of parts) {
      if (p) images.push(p);
    }
  } catch (e) {
    console.error("PDF bilder:", e);
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = buildSellSubmissionPdf(r, images);
  } catch (e) {
    console.error("PDF bygg:", e);
    return NextResponse.json(
      { error: "Kunne ikke generere PDF. Prøv igjen eller kontakt support." },
      { status: 500 },
    );
  }

  const safeReg = r.kjennemerke.replace(/[^\wæøåÆØÅ-]+/gi, "_").slice(0, 32);
  const filename = `innsending_${safeReg || id.slice(0, 8)}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
