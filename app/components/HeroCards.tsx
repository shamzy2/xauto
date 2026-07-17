import Image from "next/image";
import Link from "next/link";
import styles from "./HeroCards.module.css";

function CtaArrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="9"
      height="9"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1 9L9 1"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 1H9V9"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroCards() {
  return (
    <section className={styles.shell} aria-label="Hurtiglenker">
      <div className={styles.frame}>
        <div className={styles.row}>
          <article className={`${styles.card} ${styles.cardSelg}`}>
            <div className={styles.selgCopy}>
              <div className={styles.textStack}>
                <h2 className={styles.title}>Selg bilen din</h2>
                <p className={styles.body}>Raskt, trygt og enkelt.</p>
              </div>
              <Link href="/selg" className={`${styles.ctaRow} ${styles.ctaRowOnDark}`}>
                <span className={`${styles.ctaLabel} ${styles.ctaLabelLight}`}>Gratis verdivurdering</span>
                <CtaArrow className={styles.ctaArrow} />
              </Link>
            </div>
            <div className={styles.bleedCarSelg} aria-hidden>
              <div className={styles.bleedInner}>
                <Image
                  src="/bilder/bil1.png"
                  alt=""
                  fill
                  sizes="272px"
                  priority
                  className={styles.bleedImgSelg}
                />
              </div>
            </div>
            <Link
              href="/selg"
              className={styles.cardHitArea}
              tabIndex={-1}
              aria-hidden="true"
            />
          </article>

          <article className={`${styles.card} ${styles.cardGradient} ${styles.cardVare}`}>
            <div className={styles.vareCopy}>
              <div className={styles.textStack}>
                <h2 className={styles.title}>Våre biler</h2>
                <p className={styles.body}>Flere biler tilgjengelig.</p>
              </div>
              <Link href="/vare-biler" className={styles.ctaRow}>
                <span className={styles.ctaLabel}>Se våre biler</span>
                <CtaArrow className={styles.ctaArrow} />
              </Link>
            </div>
            <div className={styles.bleedCarVare} aria-hidden>
              <div className={styles.bleedInner}>
                <Image
                  src="/bilder/bil2.png"
                  alt=""
                  fill
                  sizes="260px"
                  priority
                  className={styles.bleedImgVare}
                />
              </div>
            </div>
            <Link
              href="/vare-biler"
              className={styles.cardHitArea}
              tabIndex={-1}
              aria-hidden="true"
            />
          </article>
        </div>

        <div className={styles.row}>
          <article className={`${styles.card} ${styles.cardGradient} ${styles.cardInnbytte}`}>
            <div className={styles.innbytteCopy}>
              <div className={styles.textStack}>
                <h2 className={styles.title}>Innbytte</h2>
                <p className={`${styles.body} ${styles.innbytteBody}`}>
                  Vi tar alle typer biler i innbytte, og gir deg et gratis og uforpliktende tilbud på din bil når du
                  handler hos oss.
                </p>
              </div>
              <Link href="/innbytte" className={styles.ctaRow}>
                <span className={styles.ctaLabel}>Fyll ut skjema</span>
                <CtaArrow className={styles.ctaArrow} />
              </Link>
            </div>
            <div className={styles.visualInnbytte}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bilder/b3.svg" alt="" width={200} height={164} />
            </div>
            <Link
              href="/innbytte"
              className={styles.cardHitArea}
              tabIndex={-1}
              aria-hidden="true"
            />
          </article>

          <article className={`${styles.card} ${styles.cardGradient} ${styles.cardReklama}`}>
            <div className={styles.cardReklamaMain}>
              <div className={styles.textStack}>
                <h2 className={styles.title}>Reklamasjonsfri!</h2>
                <p className={styles.body}>Selg bilen uten to års reklamasjonsansvar.</p>
              </div>
            </div>
            <div className={styles.visualReklama}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bilder/b4.svg" alt="" width={177} height={164} />
            </div>
            <Link
              href="/reklamasjonsfri"
              className={styles.cardHitArea}
              aria-label="Mer om reklamasjonsfri salg"
            />
          </article>
        </div>
      </div>
    </section>
  );
}
