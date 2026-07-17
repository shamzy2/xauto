import { partners, reviews } from "@/lib/siteContent";
import styles from "./HomeSocialProof.module.css";

function Stars() {
  return (
    <span className={styles.stars} aria-label="5 av 5 stjerner">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" aria-hidden>
          <path
            fill="currentColor"
            d="M8 1.2l1.76 3.56 3.93.57-2.84 2.77.67 3.91L8 10.96l-3.52 1.85.67-3.91L2.31 5.33l3.93-.57L8 1.2z"
          />
        </svg>
      ))}
    </span>
  );
}

export function HomeSocialProof() {
  const [left, mid, right] = reviews;

  return (
    <section className={styles.band} aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <header className={styles.reviewsHead}>
          <h2 id="reviews-title" className={styles.reviewsTitle}>
            Dette sier våre kunder...
          </h2>
          <span className={styles.titleRule} aria-hidden />
        </header>

        <div className={styles.bubbles}>
          <figure className={`${styles.bubbleItem} ${styles.bubbleLeft}`}>
            <blockquote className={`${styles.bubble} ${styles.tailDown}`}>
              <p>{left.quote}</p>
            </blockquote>
            <figcaption className={styles.caption}>
              <span className={styles.author}>{left.author}</span>
              <Stars />
            </figcaption>
          </figure>

          <figure className={`${styles.bubbleItem} ${styles.bubbleMid}`}>
            <blockquote className={`${styles.bubble} ${styles.tailDown}`}>
              <p>{mid.quote}</p>
            </blockquote>
            <figcaption className={styles.caption}>
              <span className={styles.author}>{mid.author}</span>
              <Stars />
            </figcaption>
          </figure>

          <figure className={`${styles.bubbleItem} ${styles.bubbleRight}`}>
            <figcaption className={`${styles.caption} ${styles.captionAbove}`}>
              <span className={styles.author}>{right.author}</span>
              <Stars />
            </figcaption>
            <blockquote className={`${styles.bubble} ${styles.tailUp}`}>
              <p>{right.quote}</p>
            </blockquote>
          </figure>
        </div>

        <div className={styles.partners}>
          <header className={styles.partnersHead}>
            <h2 id="partners-title" className={styles.partnersTitle}>
              Samarbeidspartnere
            </h2>
            <span className={styles.titleRule} aria-hidden />
          </header>

          <ul className={styles.partnerList}>
            {partners.map((p) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
