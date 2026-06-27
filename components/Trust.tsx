import { highlights } from "@/lib/content";

export default function Trust() {
  return (
    <section className="trust-row" aria-label="Dette tilbyr vi">
      <div className="trust-inner wrap">
        {highlights.map((item) => (
          <div key={item.title} className="trust-item">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
