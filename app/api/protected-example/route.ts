import { NextResponse } from "next/server";
import { getSecret } from "@/lib/server/env";

/**
 * Example pattern: read API keys only on the server, never return them to the client.
 * Replace the placeholder logic with your real integration (HTTP client, SDK, etc.).
 */
export async function GET() {
  const apiKey = getSecret("EXTERNAL_API_KEY");

  if (!apiKey) {
    return NextResponse.json(
      { error: "Integrasjon er ikke konfigurert (mangler EXTERNAL_API_KEY)." },
      { status: 503 },
    );
  }

  // Example only — do not log the key
  // const res = await fetch("https://api.vendor.example/v1/resource", {
  //   headers: { Authorization: `Bearer ${apiKey}` },
  //   cache: "no-store",
  // });

  return NextResponse.json({
    ok: true,
    message: "Nøkkel er tilgjengelig på serveren (vises aldri til klienten).",
  });
}
