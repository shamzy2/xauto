"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import flow from "./sellFlowShared.module.css";
import { SellFlowVehicleSummary } from "./SellFlowVehicleSummary";
import { useSellFlowIntakeSession } from "./useSellFlowIntakeSession";
import { useSellFlowRoute } from "./SellFlowRouteContext";

type Props = {
  children: ReactNode;
  backHref?: string;
};

/** Dinbil-inspirert sidehode + bilkort over skjematrinn. */
export function SellFlowPageShell({ children, backHref }: Props) {
  const { basePath } = useSellFlowRoute();
  const { data, loading, error } = useSellFlowIntakeSession();
  const back = backHref ?? basePath;

  return (
    <div className={flow.flowShell}>
      <div className={flow.flowInner}>
        <Link href={back} className={flow.backLink}>
          ← Tilbake
        </Link>

        <header className={flow.pageHeader}>
          <h1 className={flow.pageTitle}>Egenerklæring</h1>
          <p className={flow.pageIntro}>
            Vi har hentet tekniske opplysninger automatisk. Fyll ut henteadresse,
            legg til bilder, og svar på spørsmålene — så vi kan gi deg et godt
            tilbud.
          </p>
        </header>

        {loading ? (
          <p className={flow.loadingText}>Henter bilinformasjon …</p>
        ) : null}

        {error ? (
          <div className={flow.errorCard} role="alert">
            <p>{error}</p>
          </div>
        ) : null}

        {data ? (
          <>
            <SellFlowVehicleSummary session={data} />
            <div className={flow.flowFormCard} data-sell-flow-form-card>
              {children}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
