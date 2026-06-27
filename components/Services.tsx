import Image from "next/image";
import { services } from "@/lib/content";

export default function Services() {
  return (
    <section className="section" id="tjenester">
      <div className="wrap">
        <div className="services-head">
          <p className="section-label">Tjenester</p>
          <h2 className="section-title">Alt du trenger, samlet</h2>
          <p className="section-lead">
            Fra lån og forsikring til innbytte og klargjøring — vi tar oss av
            detaljene slik at du kan fokusere på bilen.
          </p>
        </div>

        <div className="services-grid">
          {services.map((s, i) => (
            <article key={s.title} className="service-card">
              <span className="service-card-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>

        <div className="services-visual">
          <Image
            src="/images/hero-2.jpeg"
            alt="Bil hos X Bilsenter"
            fill
            sizes="(max-width:899px) 100vw, 1240px"
          />
          <span className="services-visual-cap">650 kvm · Fetsund</span>
        </div>
      </div>
    </section>
  );
}
