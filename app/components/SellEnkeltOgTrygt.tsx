import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./SellEnkeltOgTrygt.module.css";

type FaqItem = {
  q: string;
  a: ReactNode;
};

/** Under /selg-hero (selg bilen). */
const faqItemsSellHero: FaqItem[] = [
  {
    q: "Hvordan fyller jeg ut salgsskjemaet?",
    a: "Du fyller inn informasjon om bilen din og beskriver tilstand så nøyaktig som mulig. Jo mer detaljer og bilder du legger ved, desto bedre vurdering kan vi gi.",
  },
  {
    q: "Hvor raskt får jeg et tilbud?",
    a: "Når vi har mottatt og gjennomgått informasjonen din, gir vi deg vanligvis et tilbud innen 24 timer. Vi kontakter deg direkte for videre oppfølging.",
  },
  {
    q: "Er tilbudet bindende?",
    a: "Nei, tilbudet du mottar fra oss er helt uforpliktende. Du kan selv velge om du ønsker å gå videre eller ikke.",
  },
  {
    q: "Hvordan foregår oppgjøret ved salg?",
    a: "Oppgjør skjer raskt og trygt, ofte samme dag som overlevering. Eventuelle heftelser betales direkte til banken, og resterende beløp utbetales til deg.",
  },
  {
    q: "Må jeg opplyse om skader og feil på bilen?",
    a: "Ja, det er viktig at du oppgir eventuelle feil, mangler eller skader i skjemaet. Dette gir en mer korrekt vurdering og en smidigere salgsprosess.",
  },
];

/** Under /innbytte-hero. */
const faqItemsInnbytteHero: FaqItem[] = [
  {
    q: "Hvordan fungerer innbytte hos dere?",
    a: "Du sender oss informasjon om bilen din, som registreringsnummer og kilometerstand. Vi vurderer bilen og gir deg et uforpliktende tilbud basert på marked og tilstand.",
  },
  {
    q: "Må jeg kjøpe bil for å få innbytte?",
    a: (
      <>
        Innbytte er normalt knyttet til kjøp av en bil hos oss. Dersom du kun ønsker å
        selge, kan du fylle ut{" "}
        <Link href="/selg" className={styles.inlineFaqLink}>
          salgskjema
        </Link>
        .
      </>
    ),
  },
  {
    q: "Hvor raskt får jeg svar på innbytte?",
    a: "Når vi har mottatt nødvendig informasjon, gir vi deg som regel en tilbakemelding innen 24 timer. Vi tar kontakt direkte for å avklare videre prosess.",
  },
  {
    q: "Hva påvirker prisen jeg får for bilen min?",
    a: "Pris vurderes ut fra blant annet alder, kilometerstand, tilstand og etterspørsel i markedet. Vi gjør en helhetsvurdering for å gi et realistisk og rettferdig tilbud.",
  },
  {
    q: "Må bilen være i perfekt stand for innbytte?",
    a: "Nei, vi tar inn biler i ulike tilstander og vurderer dem deretter. Eventuelle feil eller mangler tas hensyn til i tilbudet vi gir deg.",
  },
];

export type SellEnkeltOgTrygtScope = "sellHero" | "innbytteHero";

type Props = {
  /** `sellHero` = under /selg. `innbytteHero` = under /innbytte. */
  scope?: SellEnkeltOgTrygtScope;
  tone?: "light" | "dark";
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2 6L9.85858 13.8586C9.93668 13.9367 10.0633 13.9367 10.1414 13.8586L18 6"
        stroke="#EAA038"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function faqForScope(scope: SellEnkeltOgTrygtScope): FaqItem[] {
  if (scope === "innbytteHero") return faqItemsInnbytteHero;
  return faqItemsSellHero;
}

export function SellEnkeltOgTrygt({ scope = "sellHero", tone = "light" }: Props) {
  const faqItems = faqForScope(scope);
  const sectionTitle = "Ofte stilte spørsmål";

  return (
    <section
      className={`${styles.shell} ${tone === "dark" ? styles.shellDark : ""}`}
      aria-labelledby="faq-heading"
    >
      <div className={styles.inner}>
        <h2 id="faq-heading" className={styles.sectionTitle}>
          {sectionTitle}
        </h2>

        <div className={styles.faqList}>
          {faqItems.map((item) => (
            <details key={item.q} className={styles.faqItem}>
              <summary className={styles.summary}>
                <span>{item.q}</span>
                <span className={styles.chevron}>
                  <ChevronDown />
                </span>
              </summary>
              <div className={styles.answer}>{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
