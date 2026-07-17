export type AddressSuggestion = {
  id: string;
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  lat: number;
  lon: number;
};

type GeonorgeResponse = {
  adresser?: Array<{
    adressetekst: string;
    postnummer: string;
    poststed: string;
    kommunenavn: string;
    representasjonspunkt?: { lat: number; lon: number };
  }>;
};

/** Kartverket adresseregister via Geonorge — gratis, uten API-nøkkel. */
export async function searchAddresses(
  query: string,
  postalCode?: string,
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL("https://ws.geonorge.no/adresser/v1/sok");
  url.searchParams.set("sok", trimmed);
  url.searchParams.set("treffPerSide", "8");

  const code = postalCode?.replace(/\D/g, "").slice(0, 4);
  if (code?.length === 4) {
    url.searchParams.set("postnummer", code);
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as GeonorgeResponse;
  const addresses = data.adresser ?? [];

  return addresses
    .filter((a) => a.adressetekst && a.postnummer && a.poststed)
    .map((a) => ({
      id: `${a.adressetekst}-${a.postnummer}`,
      street: a.adressetekst,
      postalCode: a.postnummer,
      city: formatCityName(a.poststed),
      municipality: a.kommunenavn,
      lat: a.representasjonspunkt?.lat ?? 0,
      lon: a.representasjonspunkt?.lon ?? 0,
    }));
}

function formatCityName(name: string) {
  return name
    .toLowerCase()
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
