import Image from "next/image";
import styles from "./HomeServiceCards.module.css";

type Card = {
  title: string;
  src: string;
  body: string;
  objectPosition?: string;
};

const cards: Card[] = [
  {
    title: "Finansiering",
    src: "/bilder/hero/finans.jpg",
    body: "Finansiering på alle biler – fra 0 i egenkapital og opptil ti års nedbetaling. Vi finner et opplegg som passer.",
  },
  {
    title: "Forsikring",
    src: "/bilder/hero/forsikring.jpg",
    body: "Vi ordner forsikring til rabatterte priser hos et av landets største selskaper.",
  },
  {
    title: "Andre tjenester",
    src: "/bilder/hero/andretjenester.jpg",
    body: "Detailing, lakkforsegling og solfilm – spør oss om det du trenger.",
  },
];

export function HomeServiceCards() {
  return (
    <section className={styles.shell} aria-label="Finansiering, forsikring og andre tjenester">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {cards.map((c) => (
            <article key={c.title} className={styles.card}>
              <div className={styles.visual}>
                <Image
                  src={c.src}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className={styles.visualImg}
                  style={
                    c.objectPosition
                      ? { objectPosition: c.objectPosition }
                      : undefined
                  }
                />
              </div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.body}>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
