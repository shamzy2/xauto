import { NextResponse } from "next/server";

import { searchAddresses } from "@/lib/address/geonorge-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const postalCode = searchParams.get("postalCode") ?? undefined;

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await searchAddresses(q, postalCode);
  return NextResponse.json({ suggestions });
}
