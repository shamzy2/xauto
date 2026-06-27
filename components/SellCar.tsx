import Image from "next/image";
import Link from "next/link";
import { sellPoints } from "@/lib/content";

export default function SellCar() {
  return (
    <section className="sell-section" id="selg">
      <div className="sell-bg">
        <Image
          src="/images/35-580x380_c.jpeg"
          alt="Bilinteriør"
          fill
          sizes="100vw"
        />
      </div>

      <div className="sell-content">
        <p className="section-label">Selg bil</p>
        <h2 className="section-title">Vi kjøper bilen din</h2>
        <p>
          Uten at du trenger å handle ny hos oss. Raskt oppgjør — du slipper
          hele annonseringsprosessen.
        </p>
        <ul className="sell-list">
          {sellPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <Link href="#kontakt" className="btn btn-red">
          Få tilbud
        </Link>
      </div>
    </section>
  );
}
