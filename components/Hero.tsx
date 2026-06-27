import Image from "next/image";
import Link from "next/link";
import { site, stats } from "@/lib/content";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <Image src="/images/01.jpg" alt="Biler hos X Bilsenter" fill priority sizes="100vw" />
      </div>

      <div className="hero-badge" aria-hidden="true">
        <span className="hero-badge-num">650</span>
        <span className="hero-badge-label">kvm utstilling</span>
      </div>

      <div className="hero-inner">
        <p className="hero-tag">Fetsund · Lillestrøm</p>
        <h1 className="hero-title">
          Bilhandel gjort <em>trygt</em> og enkelt
        </h1>
        <p className="hero-lead">
          {site.tagline} Vi ordner finansiering, forsikring, innbytte og
          registrering — {site.showroom.toLowerCase()}.
        </p>
        <div className="hero-actions">
          <a href={site.phoneHref} className="btn btn-red">
            Ring oss
          </a>
          <Link href="#selg" className="btn btn-ghost">
            Selg bilen din
          </Link>
        </div>

        <div className="hero-stats" aria-label="Nøkkeltall">
          {stats.map((s) => (
            <div key={s.label} className="hero-stat">
              <strong>
                {s.value}
                {s.suffix}
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
