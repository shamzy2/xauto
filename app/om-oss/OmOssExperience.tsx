"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Menu } from "@/app/components/Menu";
import showcase from "@/app/showcase.module.css";
import { site } from "@/lib/siteContent";

import styles from "./OmOss.module.css";

const facts = [
  {
    value: "AAA-rating",
    label: "Høyeste kredittverdighet",
    icon: "rating" as const,
  },
  {
    value: "100+",
    label: "Fornøyde kunder",
    icon: "customers" as const,
  },
  {
    value: "10+",
    label: "Biler alltid på lager",
    icon: "stock" as const,
  },
] as const;

const aboutPoints = [
  {
    n: "01",
    title: "Enkel prosess",
    body: "Vi gjør bilkjøpet enkelt — med hjelp til lånesøknad, forsikring og garanti, slik at du slipper å finne ut av alt selv.",
  },
  {
    n: "02",
    title: "Personlig oppfølging",
    body: "Hos oss får du personlig oppfølging. Vi brenner for biler, og det merkes når nøklene overleveres til en fornøyd kunde.",
  },
  {
    n: "03",
    title: "Besøk oss",
    body: "Du finner oss på Fetsund i Lillestrøm kommune. Kom innom for en hyggelig bilprat.",
  },
] as const;

function FactIcon({ type }: { type: (typeof facts)[number]["icon"] }) {
  if (type === "stock") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden className={styles.factSvg}>
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M24 12v12l8 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={styles.factSvg}>
      <path
        d="M24 8l2.4 7.2H34l-6 4.4 2.3 7.2L24 22.4l-6.3 4.4 2.3-7.2-6-4.4h7.6L24 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 36c2.8-4 7-6 12-6s9.2 2 12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OmOssExperience() {
  const aboutRef = useRef<HTMLElement>(null);
  const [aboutInView, setAboutInView] = useState(false);

  useEffect(() => {
    const el = aboutRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAboutInView(true);
      return;
    }

    let revealed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !revealed) {
          revealed = true;
          setAboutInView(true);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    const raf = window.requestAnimationFrame(() => io.observe(el));
    return () => {
      window.cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div className={styles.page}>
      <Menu />

      <section
        className={`${showcase.subHero} ${showcase.subHeroUnderNav}`}
        aria-labelledby="om-oss-title"
      >
        <div className={showcase.subHeroBg}>
          <Image
            src="/Image00005-16.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className={styles.heroImg}
          />
        </div>
        <div className={`${showcase.subHeroInner} ${styles.heroInner}`}>
          <h1 id="om-oss-title" className={showcase.subHeroTitle}>
            Om oss
          </h1>
          <p className={styles.heroLead}>Bli bedre kjent med oss</p>
        </div>
      </section>

      <section
        ref={aboutRef}
        className={`${styles.about} ${aboutInView ? styles.aboutIn : ""}`}
        aria-labelledby="about-heading"
      >
        <div className={styles.aboutInner}>
          <header className={styles.aboutHeader}>
            <p className={styles.aboutEyebrow}>X Auto AS</p>
            <h2 id="about-heading" className={styles.aboutTitle}>
              Om {site.name}
            </h2>
            <p className={styles.aboutLead}>
              Bilbutikken for deg som ønsker en 100&nbsp;% enkel og trygg handel.
            </p>
          </header>

          <ol className={styles.aboutPoints}>
            {aboutPoints.map((point) => (
              <li key={point.n} className={styles.aboutPoint}>
                <span className={styles.aboutPointN}>{point.n}</span>
                <h3 className={styles.aboutPointTitle}>{point.title}</h3>
                <p className={styles.aboutPointBody}>{point.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.facts} aria-labelledby="facts-heading">
        <div className={styles.factsInner}>
          <h2 id="facts-heading" className={styles.factsTitle}>
            <span className={styles.factsAccent} aria-hidden />
            Fun facts
          </h2>
          <ul className={styles.factsGrid}>
            {facts.map((fact) => (
              <li key={fact.label} className={styles.factItem}>
                <span className={styles.factIcon}>
                  <FactIcon type={fact.icon} />
                </span>
                <p className={styles.factValue}>{fact.value}</p>
                <p className={styles.factLabel}>{fact.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
