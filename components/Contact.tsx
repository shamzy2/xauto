import Link from "next/link";
import { nav, openingHours, site } from "@/lib/content";

export default function Contact() {
  return (
    <section className="contact-section" id="kontakt">
      <div className="wrap contact-grid">
        <div>
          <p className="section-label">Kontakt</p>
          <h2 className="section-title">Snakk med oss</h2>
          <p className="section-lead">
            Vil du selge bil, få tilbud på innbytte eller bare stille spørsmål?
            Vi svarer gjerne.
          </p>

          <dl className="contact-details">
            <div className="contact-item">
              <dt>Telefon</dt>
              <dd>
                <a href={site.phoneHref}>{site.phone}</a>
              </dd>
            </div>
            <div className="contact-item">
              <dt>E-post</dt>
              <dd>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
            </div>
            <div className="contact-item">
              <dt>Besøk</dt>
              <dd>
                {site.address.street}
                <br />
                {site.address.city}
              </dd>
            </div>
          </dl>

          <Link href={`mailto:${site.email}`} className="btn btn-red" style={{ marginTop: "0.5rem" }}>
            Send e-post
          </Link>
        </div>

        <div>
          <p className="section-label">Åpningstider</p>
          <h2 className="section-title">Når vi er her</h2>
          <div className="hours-list">
            {openingHours.map((row) => (
              <div key={row.day} className="hours-row">
                <span>{row.day}</span>
                <span>{row.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="contact-bar">
        <span>{site.name} · © {new Date().getFullYear()}</span>
        <div className="contact-bar-links">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
