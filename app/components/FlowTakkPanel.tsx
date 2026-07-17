"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SELL_FLOW_WIZARD_STEP_COUNT } from "@/lib/sellFlowSteps";
import { useScrollFlowStepFocus } from "@/app/lib/useScrollFlowStepFocus";
import flow from "./sellFlowShared.module.css";

type Props = {
  message: string;
  homeHref?: string;
  restartHref: string;
  restartLabel: string;
};

function CheckIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Bekreftelse etter fullført salgs-/innbytte-flyt — samme uttrykk som steg 1–4. */
export function FlowTakkPanel({
  message,
  homeHref = "/",
  restartHref,
  restartLabel,
}: Props) {
  const pathname = usePathname();
  const focusRef = useScrollFlowStepFocus(`${pathname}-takk`);

  return (
    <div className={flow.flowShell}>
      <div className={flow.flowInner}>
        <div className={flow.flowFormCard} data-sell-flow-form-card>
          <div
            ref={focusRef}
            className={flow.takkCard}
            role="status"
            aria-labelledby="takk-title"
          >
            <div className={flow.takkProgress} aria-hidden>
              <div className={flow.progressRow}>
                {Array.from({ length: SELL_FLOW_WIZARD_STEP_COUNT }, (_, i) => (
                  <span
                    key={i}
                    className={`${flow.progressSeg} ${flow.progressSegActive}`}
                  />
                ))}
              </div>
            </div>

            <span className={flow.takkIcon}>
              <CheckIcon />
            </span>

            <h1 id="takk-title" className={flow.takkTitle}>
              Takk!
            </h1>
            <p className={flow.takkLead}>{message}</p>

            <div className={flow.takkActions}>
              <Link href={homeHref} className={flow.flowBtnPrimary}>
                Til forsiden
              </Link>
              <Link href={restartHref} className={flow.flowBtnGhost}>
                {restartLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
