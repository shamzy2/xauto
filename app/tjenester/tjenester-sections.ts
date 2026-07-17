export type TjenesteSection = {
  id: string;
  tabLabel: string;
  title: string;
  lead: string;
  paragraphs: readonly string[];
  list: readonly string[];
  foot: string;
};

export const TJENESTER_SECTIONS: readonly TjenesteSection[] = [
  {
    id: "solfilm",
    tabLabel: "Solfilm",
    title: "Solfilm på ruter",
    lead: "Lavere temperatur i kupeen og mindre gjenskinn, montert ryddig og i tråd med regelverket.",
    paragraphs: [
      "Vi legger solfilm på ruter mot et gunstig pristillegg, tilpasset biltype og ønsket grad av toning. Solfilm kan gi lavere temperatur i kupeen, mindre gjenskinn i skjermer og bedre komfort på varme dager.",
      "Vi bruker produkter vi kjenner godt og monterer med ryddig finish langs kanter og lister. Vi veileder deg gjerne før du velger grad av toning, slik at det passer bilen og regelverket.",
    ],
    list: [
      "Valg av lysgjennomtrengelighet i tråd med regelverk",
      "Montering på side- og bakruter etter avtale",
    ],
    foot: "Pris etter avtale, ta kontakt for tilbud på din bil.",
  },
  {
    id: "detailing",
    tabLabel: "Detailing",
    title: "Detailing, polering og lakkforsegling",
    lead: "Ren, glatt og beskyttet lakk, enten du beholder bilen lenge eller vil presentere den før salg.",
    paragraphs: [
      "Vi har god erfaring med detailing og bistår med polering, coating eller annen lakkforsegling. Målet er å få lakken ren, glatt og beskyttet, enten du skal beholde bilen lenge, eller vil presentere den best mulig før salg.",
      "Vi avklarer alltid omfang og forventet resultat før vi starter. Coating og forsegling kan gi enklere vask og bedre motstandsdyktighet mot smuss og værslitasje når det utføres riktig.",
    ],
    list: [
      "Maskinpolering og korrigering etter behov",
      "Keramisk coating eller annen lakkforsegling",
      "Råd om vedlikehold etter behandling",
    ],
    foot: "Timepris og pakker avtales, send gjerne bilde og ønske, så ser vi på det sammen.",
  },
  {
    id: "klargjoring",
    tabLabel: "Klargjøring",
    title: "Klargjøring før salg eller levering",
    lead: "Praktisk pakke tilpasset bilens stand, bilen skal se ryddig og presentabel ut.",
    paragraphs: [
      "Ønsker du at bilen skal fremstå ryddig og presentabel, til salg, bytte eller levering, kan vi sette sammen en praktisk pakke. Omfang tilpasses bilens stand og hva du vil oppnå.",
    ],
    list: [
      "Utvendig vask og tørking",
      "Interiør: støvsuging, overflater og glass",
      "Motorrom og detaljer etter avtale",
    ],
    foot: "Fastpris eller pakketilbud, vi avtaler på forhånd.",
  },
] as const;
