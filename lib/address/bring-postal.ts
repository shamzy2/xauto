export type PostalLookupResult = {
  postalCode: string;
  city: string;
  valid: boolean;
};

/** Bring postnummer-oppslag — gratis, uten API-nøkkel. */
export async function lookupPostalCode(
  postalCode: string,
): Promise<PostalLookupResult | null> {
  const code = postalCode.replace(/\D/g, "").slice(0, 4);
  if (code.length !== 4) return null;

  const url = new URL(
    "https://api.bring.com/shippingguide/api/postalCode.json",
  );
  url.searchParams.set("clientUrl", "xbilsenter.no");
  url.searchParams.set("country", "no");
  url.searchParams.set("pnr", code);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    valid?: boolean;
    result?: string;
  };

  if (!data.valid || !data.result) return null;

  return {
    postalCode: code,
    city: formatCityName(data.result),
    valid: true,
  };
}

function formatCityName(name: string) {
  return name
    .toLowerCase()
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
