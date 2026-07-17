import type { Metadata } from "next";

import { Menu } from "@/app/components/Menu";
import { openingHours, site } from "@/lib/siteContent";
import { KontaktForm } from "./KontaktForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kontakt oss",
  description:
    "Kontakt X Auto på telefon eller e-post. Finn adresse og veibeskrivelse til Fetsund.",
};

const kontaktHours = [
  { day: "Mandag - Fredag", time: openingHours[0].hours.replace("–", " - "), timeVariant: "accent" as const },
  { day: "Lørdag", time: openingHours[1].hours.replace("–", " - "), timeVariant: "accent" as const },
  { day: "Søndag", time: "Stengt / Etter avtale", timeVariant: "alert" as const },
] as const;

export default function KontaktPage() {
  return (
    <div className={styles.heroBand}>
      <Menu />
      <main className={styles.kontaktMain}>
        <section className={styles.hero} aria-label="Kontakt X Auto">
          <h1 className={styles.pageTitle}>Kontakt oss</h1>
          <p className={styles.pageLead}>
            Ring, send e-post eller fyll ut skjemaet — vi svarer så raskt vi kan.
          </p>

          <div className={styles.contactGrid}>
            <section className={styles.contactPanel} aria-label="Kontaktskjema og kontaktinfo">
              <div className={styles.formWrap}>
                <h2 className={styles.panelTitle}>Send oss en henvendelse</h2>
                <p className={styles.panelLead}>
                  Fyll ut skjemaet, så åpnes e-posten ferdig utfylt og klar til sending.
                </p>
                <KontaktForm />
              </div>

              <aside className={styles.infoCard}>
                <h2 className={styles.cardTitle}>Kontaktinformasjon</h2>
                <dl className={styles.infoList}>
                  <div>
                    <dt className={styles.term}>E-post</dt>
                    <dd className={styles.value}>
                      <a href={`mailto:${site.email}`} className={styles.valueLink}>
                        {site.email.toUpperCase()}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className={styles.term}>Adresse</dt>
                    <dd className={styles.value}>
                      <a
                        href={site.address.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.valueLink}
                      >
                        {site.address.formatted}
                      </a>
                    </dd>
                  </div>
                </dl>

                <ul className={styles.hours}>
                  {kontaktHours.map((item) => (
                    <li key={item.day} className={styles.hoursRow}>
                      <span className={styles.hoursDay}>{item.day}</span>
                      <span
                        className={
                          item.timeVariant === "alert"
                            ? styles.hoursTimeAlert
                            : styles.hoursTimeAccent
                        }
                      >
                        {item.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>
            </section>
          </div>
        </section>
      </main>

      <section className={styles.mapBand} aria-label="Kart">
        <div className={styles.mapShell}>
          <iframe
            title="Kart til X Auto AS"
            src={site.address.mapsUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={styles.mapIframe}
          />
        </div>
      </section>
    </div>
  );
}
