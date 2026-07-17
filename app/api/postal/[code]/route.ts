import { NextResponse } from "next/server";

import { lookupPostalCode } from "@/lib/address/bring-postal";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const result = await lookupPostalCode(code);

  if (!result) {
    return NextResponse.json({ error: "Ugyldig postnummer" }, { status: 404 });
  }

  return NextResponse.json(result);
}
