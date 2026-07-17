"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "./HomeHero.module.css";

const heroSlides = [
  { src: "/bilder/hero/range.webp", alt: "Tjenester hos X Auto" },
  { src: "/bilder/hero/bilde2.webp", alt: "Forsikring hos X Auto", objectPosition: "center 58%" },
  { src: "/bilder/hero/volvo1.jpg", alt: "Bil hos X Auto", flip: true },
] as const;

const ctas = [
  { href: "/vare-biler", label: "Våre biler", variant: "solid" as const },
  { href: "/selg", label: "Selg bilen din", variant: "solid" as const },
  { href: "/innbytte", label: "Innbytte", variant: "ghost" as const },
];

export function HomeHero() {
  const [active, setActive] = useState(0);

  const go = useCallback((index: number) => {
    setActive((index + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % heroSlides.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className={styles.shell} aria-label="Forside">
      <div className={styles.stage}>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.src}
            className={`${styles.slide} ${index === active ? styles.slideActive : ""}`}
            aria-hidden={index !== active}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              className={`${styles.slideImg}${"flip" in slide && slide.flip ? ` ${styles.slideImgFlip}` : ""}`}
              style={"objectPosition" in slide ? { objectPosition: slide.objectPosition } : undefined}
              priority={index === 0}
            />
          </div>
        ))}
        <div className={styles.shade} aria-hidden />
      </div>

      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.brand}>X Auto AS</p>
          <h1 className={styles.headline}>
            <span className={styles.headlineLine}>Bilhandel gjort</span>
            <span className={`${styles.headlineLine} ${styles.headlineThin}`}>
              trygt og enkelt
            </span>
          </h1>
          <p className={styles.lead}>
            Bruktbil, innbytte og salg — lokalt eller på avstand.
          </p>
        </div>

        <aside className={styles.aside}>
          <p className={styles.asideLabel}>Hos oss får du</p>
          <p className={styles.asideHighlight}>100% TILFREDSHET MED BILKJØPET.</p>
          <div className={styles.ctaStack}>
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={`showcasePill ${cta.variant === "solid" ? "showcasePillSolid" : "showcasePillGhost"}`}
              >
                <span>{cta.label}</span>
                <span className="showcasePillArrow" aria-hidden>
                  ›
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.progress} role="tablist" aria-label="Velg bilde">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Bilde ${index + 1}`}
              className={`${styles.progressItem} ${index === active ? styles.progressActive : ""}`}
              onClick={() => go(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
