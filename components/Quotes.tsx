import { reviews } from "@/lib/content";

export default function Quotes() {
  const [lead, ...rest] = reviews;

  return (
    <section className="section quote-section">
      <div className="wrap">
        <blockquote className="quote-block">
          <p className="quote-mark" aria-hidden="true">
            &ldquo;
          </p>
          <p className="quote-text">{lead.quote}</p>
          <footer className="quote-author">{lead.author}</footer>
        </blockquote>

        <div className="quote-more">
          {rest.map((r) => (
            <blockquote key={r.author} className="quote-mini">
              <p>&ldquo;{r.quote}&rdquo;</p>
              <footer>{r.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
