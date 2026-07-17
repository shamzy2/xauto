import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/siteContent";
import styles from "./HomeAbout.module.css";

export function HomeAbout() {
  return (
    <section className={styles.shell} aria-labelledby="about-title">
      <Link href="/biler" className={styles.visual} aria-label="Se våre biler">
        <Image
          src="/bilder/hero/range.webp"
          alt=""
          fill
          sizes="(max-width:899px) 100vw, 50vw"
          className={styles.visualImg}
          priority={false}
        />
        <span className={styles.visualShade} aria-hidden />
        <span className={styles.visualLabel}>
          <span className={styles.visualFrame}>
            <svg
              className={styles.visualRing}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <rect
                className={styles.visualRingPath}
                x="1.5"
                y="1.5"
                width="97"
                height="97"
                pathLength="100"
              />
            </svg>
            <span className={styles.visualTitle}>Våre biler</span>
          </span>
        </span>
      </Link>

      <div className={styles.copy}>
        <h2 id="about-title" className={styles.title}>
          Om oss
        </h2>
        <span className={styles.titleRule} aria-hidden />

        <p className={styles.lead}>
          {site.name}
          {" "}
          er bilbutikken for deg som ønsker en 100&nbsp;% enkel og trygg handel.
        </p>

        <div className={styles.body}>
          <p>
            Vi gjør bilkjøpet enkelt — med hjelp til lånesøknad, forsikring og
            garanti, slik at du slipper å finne ut av alt selv.
          </p>
          <p>
            Hos oss får du personlig oppfølging. Vi brenner for biler, og det
            merkes når nøklene overleveres til en fornøyd kunde.
          </p>
          <p>
            Du finner oss på Fetsund i Lillestrøm kommune. Kom innom for en
            hyggelig bilprat.
          </p>
        </div>
      </div>
    </section>
  );
}
