/** Sentralt innhold — adresse, kontakt, salg/innbytte (som xauto/lib/content). */

export const site = {
  name: "X Auto AS",
  tagline: "Bilhandel gjort trygt og enkelt.",
  email: "post@xauto.no",
  address: {
    street: "Rovenveien 125",
    postalCode: "1900",
    city: "Fetsund",
    region: "Lillestrøm kommune",
    /** Én linje for header / lister */
    label: "Rovenveien 125, Fetsund",
    /** Full adresse med postnummer */
    formatted: "Rovenveien 125, 1900 Fetsund",
    mapsUrl:
      "https://maps.google.com/maps?q=Rovenveien+125,+1900+Fetsund&t=&z=15&ie=UTF8&iwloc=&output=embed",
    mapsLink: "https://maps.google.com/maps?q=Rovenveien+125,+1900+Fetsund",
  },
  showroom: "1000 kvm utstillingsareal på Fetsund",
} as const;

export const sellPoints = [
  "Slipper annonser, visninger og prøvekjøringer",
  "Vi tar reklamasjonsansvar etter overtakelse",
  "Oppgjør ved innlevering — ofte samme dag",
] as const;

export const innbyttePoints = [
  "Uforpliktende tilbud innen 24 timer",
  "Vi håndterer heftelser og papirer",
  "Smidig innbytte når du kjøper bil hos oss",
] as const;

export const openingHours = [
  { day: "Man–fre", hours: "09:00–17:00" },
  { day: "Lør", hours: "10:00–15:00" },
  { day: "Søn", hours: "Stengt / etter avtale" },
] as const;

export const reviews = [
  {
    quote:
      "Selger ordnet alt fra A til Å. Enkel prosess, hyggelig oppfølging etter handelen.",
    author: "Martin K.",
  },
  {
    quote:
      "Bilen er som avtalt. Grei og imøtekommende selger — anbefales videre.",
    author: "Heidi S.",
  },
  {
    quote:
      "Fornøyd hittil. Handler gjerne bil av dere igjen ved en senere anledning.",
    author: "Thomas L.",
  },
] as const;

export const partners = [
  { name: "SpareBank 1", category: "Finansiering" },
  { name: "Santander", category: "Finansiering" },
  { name: "DNB", category: "Finansiering" },
  { name: "If", category: "Forsikring" },
  { name: "Gjensidige", category: "Forsikring" },
  { name: "Fremtind", category: "Forsikring" },
  { name: "Enter", category: "Forsikring" },
  { name: "Tryg", category: "Forsikring" },
] as const;

export type SellFlowVariant = "sell" | "innbytte";

export const sellFlowHero = {
  sell: {
    label: "Selg bil",
    title: "Vi kjøper bilen din",
    lead:
      "Uten at du trenger å handle ny hos oss. Raskt oppgjør — du slipper hele annonseringsprosessen.",
    points: sellPoints,
    image: "/bilder/hero/bilde2.webp",
    imageAlt: "Bilinteriør hos X Auto",
    imagePosition: "center 58%",
    ariaLabel: "Fortsett med salg",
    cta: "Fortsett",
    ctaLoading: "Henter data…",
  },
  innbytte: {
    label: "Innbytte",
    title: "Bytt inn bilen din",
    lead:
      "Send inn registreringsnummer og kilometerstand — vi svarer med et konkret innbyttetilbud.",
    points: innbyttePoints,
    image: "/bilder/hero/range.webp",
    imageAlt: "Bil hos X Auto",
    imagePosition: "center 40%",
    ariaLabel: "Fortsett med innbytte",
    cta: "Fortsett",
    ctaLoading: "Henter data…",
  },
} as const satisfies Record<
  SellFlowVariant,
  {
    label: string;
    title: string;
    lead: string;
    points: readonly string[];
    image: string;
    imageAlt: string;
    imagePosition: string;
    ariaLabel: string;
    cta: string;
    ctaLoading: string;
  }
>;
