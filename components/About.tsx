import Image from "next/image";
import { site } from "@/lib/content";

export default function About() {
  return (
    <section className="section section-raised" id="om-oss">
      <div className="wrap about-grid">
        <div className="about-photo">
          <div className="about-photo-main">
            <Image
              src="/images/01-00.39.56.jpg"
              alt="Utstillingslokale hos X Bilsenter"
              fill
              sizes="(max-width:899px) 100vw, 45vw"
            />
          </div>
          <div className="about-photo-accent">
            <Image
              src="/images/hero-3.jpeg"
              alt="Bil"
              fill
              sizes="200px"
            />
          </div>
        </div>

        <div className="about-body">
          <p className="section-label">Om oss</p>
          <h2 className="section-title">Lokal bilhandel siden dag én</h2>
          <p>
            X Bilsenter AS er bilbutikken for deg som vil ha en enkel og trygg
            handel. Vi hjelper med alt som omhandler bil — og følger deg opp
            etter handelen.
          </p>
          <p>
            Ring gjerne før du kommer, så bilen du vil se står klar til visning.
          </p>

          <dl className="about-meta">
            <div>
              <dt>Adresse</dt>
              <dd>
                {site.address.street}, {site.address.city}
              </dd>
            </div>
            <div>
              <dt>Areal</dt>
              <dd>{site.showroom}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>
                <a href={site.phoneHref}>{site.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Kart</dt>
              <dd>
                <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Google Maps
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
