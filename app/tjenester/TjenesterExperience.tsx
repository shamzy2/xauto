"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Menu } from "@/app/components/Menu";
import showcase from "@/app/showcase.module.css";

import type { TjenesteSection } from "./tjenester-sections";
import styles from "./TjenesterExperience.module.css";

type Props = { sections: readonly TjenesteSection[] };

export function TjenesterExperience({ sections }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "solfilm");
  const active = useMemo(
    () => sections.find((s) => s.id === activeId) ?? sections[0],
    [sections, activeId],
  );

  if (!active) return null;

  return (
    <div className={styles.page}>
      <Menu />

      <section className={`${showcase.subHero} ${showcase.subHeroUnderNav}`} aria-labelledby="tjenester-title">
        <div className={showcase.subHeroBg}>
          <Image
            src="/bilder/hero/andretjenester.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
          />
        </div>
        <div className={showcase.subHeroShade} aria-hidden />
        <div className={showcase.subHeroInner}>
          <p className={showcase.subHeroEyebrow}>Vi tilbyr også</p>
          <h1 id="tjenester-title" className={showcase.subHeroTitle}>
            Andre tjenester
          </h1>
          <p className={showcase.subHeroLead}>
            Solfilm, detailing og klargjøring hos oss på Fetsund.
          </p>
          <div className={styles.heroActions}>
            <Link href="/kontakt" className={`showcasePill showcasePillSolid ${styles.heroCta}`}>
              <span>Kontakt oss</span>
              <span className="showcasePillArrow" aria-hidden>
                ›
              </span>
            </Link>
            <Link href="/selg" className={`showcasePill showcasePillGhost ${styles.heroCta}`}>
              <span>Selg bilen din</span>
              <span className="showcasePillArrow" aria-hidden>
                ›
              </span>
            </Link>
          </div>
        </div>
      </section>

      <nav className={showcase.subNavBar} aria-label="Velg tjeneste">
        <div className={showcase.subNavInner}>
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${showcase.subNavLink} ${s.id === active.id ? showcase.subNavLinkActive : ""}`}
              aria-current={s.id === active.id ? "true" : undefined}
              onClick={() => setActiveId(s.id)}
            >
              {s.tabLabel}
            </button>
          ))}
        </div>
      </nav>

      <section className={styles.content}>
        <div className={styles.layout}>
          <article className={styles.mainCol}>
            <h2 className={styles.serviceTitle}>{active.title}</h2>
            <div className={styles.prose}>
              {active.paragraphs.map((p, idx) => (
                <p key={`${active.id}-p-${idx}`}>{p}</p>
              ))}
            </div>
            <ul className={styles.list}>
              {active.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.foot}>{active.foot}</p>
          </article>

          <aside className={styles.sideCol}>
            <p className={styles.sideLabel}>Pris</p>
            <p className={styles.sidePrice}>Tilbud etter avtale</p>
            <p className={styles.sideBody}>
              Vi fastsetter pris når vi har sett bilen og hva du ønsker utført.
            </p>
            <a href="tel:+4792050990" className={`showcasePill showcasePillDark ${styles.sideCta}`}>
              <span>Ring 920 50 990</span>
              <span className="showcasePillArrow" aria-hidden>
                ›
              </span>
            </a>
            <a
              href="mailto:post@xbilsenter.no"
              className={`showcasePill showcasePillGhost ${styles.sideCta} ${styles.sideCtaGhost}`}
            >
              <span>post@xbilsenter.no</span>
              <span className="showcasePillArrow" aria-hidden>
                ›
              </span>
            </a>
          </aside>
        </div>
      </section>
    </div>
  );
}
