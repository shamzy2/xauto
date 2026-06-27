export const site = {
  name: "X Bilsenter AS",
  tagline: "Bilhandel gjort trygt og enkelt.",
  phone: "+47 920 50 990",
  phoneHref: "tel:+4792050990",
  email: "post@xbilsenter.no",
  address: {
    street: "Rovenveien 125",
    city: "1900 Fetsund",
    region: "Lillestrøm kommune",
    mapsUrl: "https://goo.gl/maps/h5HdUQAphUpHR1GdA",
  },
  showroom: "650 kvm utstillingsareal på Fetsund",
  social: {
    facebook: "https://www.facebook.com/xbilsenter",
    instagram: "https://instagram.com/xbilsenter",
  },
} as const;

export const nav = [
  { label: "Tjenester", href: "#tjenester" },
  { label: "Selg bil", href: "#selg" },
  { label: "Om oss", href: "#om-oss" },
  { label: "Kontakt", href: "#kontakt" },
] as const;

export const stats = [
  { value: 650, suffix: " kvm", label: "Utstillingsareal" },
  { value: 100, suffix: "%", label: "Fornøyde kunder" },
  { value: 10, suffix: " år", label: "Nedbetalingstid" },
  { value: 0, suffix: " kr", label: "Egenkapital mulig" },
] as const;

export const highlights = [
  {
    title: "Bruktbilgaranti",
    text: "På biler der nybilgarantien er utløpt — med mindre annet avtales.",
  },
  {
    title: "Autoreg-avtale",
    text: "Godkjent forhandler. Ta bilen med hjem samme dag.",
  },
  {
    title: "Finansiering",
    text: "Opptil 10 års nedbetaling. 0 kr i egenkapital mulig.",
  },
  {
    title: "Transport",
    text: "Grundig beskrivelse. Levering hjem ved behov.",
  },
] as const;

export const services = [
  {
    title: "Innbytte",
    text: "Send inn info om bilen din — vi svarer med et konkret tilbud.",
  },
  {
    title: "Finansiering",
    text: "Samarbeid med SpareBank 1, Santander, DNB og flere.",
  },
  {
    title: "Forsikring",
    text: "If, Gjensidige, Fremtind, Enter og Tryg til gunstige priser.",
  },
  {
    title: "Detailing",
    text: "Polering, coating, lakkforsegling og solfilm.",
  },
] as const;

export const sellPoints = [
  "Slipper annonser, visninger og prøvekjøringer",
  "Vi tar reklamasjonsansvaret etter overtakelse",
  "Oppgjør ved innlevering — ofte samme dag",
] as const;

export const reviews = [
  {
    quote:
      "Selger ordnet alt fra A til Å. Enkel prosess, hyggelig oppfølging etter handelen.",
    author: "Joachim R.",
  },
  {
    quote:
      "Bilen er som avtalt. Grei og imøtekommende selger — anbefales videre.",
    author: "Ronny M.",
  },
  {
    quote:
      "Fornøyd hittil. Handler gjerne bil av dere igjen ved en senere anledning.",
    author: "Stig A.",
  },
] as const;

export const openingHours = [
  { day: "Man–fre", hours: "09:00–18:00" },
  { day: "Lør", hours: "10:00–15:00" },
  { day: "Søn", hours: "Etter avtale" },
] as const;

export const stripItems = [
  "Bruktbilgaranti",
  "Innbytte",
  "Finansiering",
  "Forsikring",
  "Autoreg",
  "Fetsund",
  "650 kvm",
  "Transport",
] as const;
