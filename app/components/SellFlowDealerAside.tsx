import { site } from "@/lib/siteContent";
import flow from "./sellFlowShared.module.css";

/** Forhandlerinfo i salgs-/innbytte-flyt (xauto-stil). */
export function SellFlowDealerAside() {
  return (
    <aside className={flow.dealerAside} aria-label="X Bilsenter kontakt">
      <p className={flow.dealerAsideTitle}>X Bilsenter</p>
      <dl className={flow.dealerAsideList}>
        <div>
          <dt>Besøk</dt>
          <dd>
            <a href={site.address.mapsLink} target="_blank" rel="noopener noreferrer">
              {site.address.formatted}
            </a>
          </dd>
        </div>
        <div>
          <dt>Telefon</dt>
          <dd>
            <a href={site.phoneHref}>{site.phone}</a>
          </dd>
        </div>
        <div>
          <dt>E-post</dt>
          <dd>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </dd>
        </div>
      </dl>
    </aside>
  );
}
