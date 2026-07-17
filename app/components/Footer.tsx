import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/siteContent";
import styles from "./Footer.module.css";

const navLinks = [
  { href: "/vare-biler", label: "Våre biler" },
  { href: "/innbytte", label: "Innbytte" },
  { href: "/selg", label: "Selg bilen din" },
  { href: "/tjenester", label: "Tjenester" },
  { href: "/kontakt", label: "Kontakt oss" },
] as const;

const social = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  linkedin: "https://www.linkedin.com/",
} as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link href="/" className={styles.logoLink} aria-label="X Auto, hjem">
              <Image
                className={styles.logo}
                src="/xauto.svg"
                alt=""
                width={1967}
                height={560}
                sizes="(max-width: 900px) 180px, 240px"
              />
            </Link>
            <p className={styles.tagline}>{site.tagline}</p>
            <address className={styles.address}>
              {site.address.formatted}
              <br />
              <a href={site.phoneHref}>{site.phone}</a>
              {" · "}
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </address>
          </div>

          <nav className={styles.navCol} aria-label="Sider">
            <h2 className={styles.colTitle}>Sider</h2>
            <ul className={styles.navList}>
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link className={styles.navLink} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.ctaCol}>
            <Link href="/selg" className={`showcasePill showcasePillSolid ${styles.footerCta}`}>
              <span>Selg bilen din</span>
              <span className="showcasePillArrow" aria-hidden>
                ›
              </span>
            </Link>
            <Link href="/vare-biler" className={`showcasePill showcasePillGhost ${styles.footerCta}`}>
              <span>Våre biler</span>
              <span className="showcasePillArrow" aria-hidden>
                ›
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.divider} aria-hidden />

        <div className={styles.bottom}>
          <ul className={styles.social}>
            <li>
              <a
                className={`${styles.socialLink} ${styles.socialFb}`}
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.visuallyHidden}>Facebook</span>
              </a>
            </li>
            <li>
              <a
                className={`${styles.socialLink} ${styles.socialIg}`}
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.visuallyHidden}>Instagram</span>
              </a>
            </li>
            <li>
              <a
                className={`${styles.socialLink} ${styles.socialIn}`}
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.visuallyHidden}>LinkedIn</span>
              </a>
            </li>
          </ul>
          <p className={styles.copyright}>
            © X Auto AS {year}
            <span aria-hidden="true"> · </span>
            Levert av{" "}
            <a href="https://kynetic.no" className={styles.creditLink} target="_blank" rel="noopener noreferrer">
              Kynetic
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
