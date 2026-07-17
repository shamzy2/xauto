import styles from "./SellHowItWorks.module.css";

type Step = {
  num: string;
  title: string;
  body: string;
};

const stepsSell: readonly Step[] = [
  {
    num: "01",
    title: "Fortell oss om bilen din",
    body: "Fyll ut salgsskjemaet og beskriv bilen så godt du kan, inkludert eventuelle skader og mangler.",
  },
  {
    num: "02",
    title: "Uforpliktende tilbud",
    body: "Du mottar et tilbud innen 24 timer etter at vi har vurdert informasjonen du har sendt.",
  },
  {
    num: "03",
    title: "Trygt salg",
    body: "Raskt og trygt oppgjør samme dag. Heftelser betales til banken, resten utbetales til deg.",
  },
];

const stepsInnbytte: readonly Step[] = [
  {
    num: "01",
    title: "Fyll ut innbytteskjemaet",
    body: "Oppgi informasjon om bilen du ønsker å bytte inn, inkludert kilometerstand, utstyr og eventuelle skader eller mangler.",
  },
  {
    num: "02",
    title: "Motta et uforpliktende tilbud",
    body: "Vi vurderer bilen din og sender deg et uforpliktende innbyttetilbud, normalt innen 24 timer.",
  },
  {
    num: "03",
    title: "Lever bilen og fullfør innbyttet",
    body: "Når du kjøper bil hos oss, leverer du inn bilen din. Vi ordner oppgjøret og innfrir eventuelle heftelser.",
  },
];

export type SellHowItWorksVariant = "sell" | "innbytte";

type Props = {
  variant?: SellHowItWorksVariant;
};

export function SellHowItWorks({ variant = "sell" }: Props) {
  const headingId =
    variant === "innbytte" ? "innbytte-how-heading" : "sell-how-heading";
  const steps = variant === "innbytte" ? stepsInnbytte : stepsSell;

  return (
    <section className={styles.shell} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={headingId} className={styles.title}>
            {variant === "innbytte" ? "Trygt innbytte hos X Auto" : "Selg bilen din hos X Auto"}
          </h2>
          <p className={styles.subtitle}>
            {variant === "innbytte"
              ? "Smidig innbytteprosess med rask vurdering og ryddig oppgjør."
              : "Raskt og trygt salg — steg for steg."}
          </p>
        </header>

        <div className={styles.grid}>
          {steps.map((step) => (
            <article key={`${variant}-${step.title}`} className={styles.step}>
              <span className={styles.num} aria-hidden>
                {step.num}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
