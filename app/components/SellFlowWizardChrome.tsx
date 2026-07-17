"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useScrollFlowStepFocus } from "@/app/lib/useScrollFlowStepFocus";
import flow from "./sellFlowShared.module.css";

type Props = {
  stepIndex: number;
  stepCount: number;
  title: string;
  lead: string;
  backHref?: string;
  children: ReactNode;
  /** Extra key for sub-steps on the same route (e.g. service → utstyr). */
  focusKey?: string;
};

/** Dinbil-inspirert steg-header med fremdriftslinje. */
export function SellFlowWizardChrome({
  stepIndex,
  stepCount,
  title,
  lead,
  backHref,
  children,
  focusKey,
}: Props) {
  const pathname = usePathname();
  const stepFocusRef = useScrollFlowStepFocus(
    `${pathname}-${stepIndex}-${focusKey ?? title}`,
    stepIndex > 0,
  );

  return (
    <div className={flow.wizard}>
      {backHref ? (
        <Link href={backHref} className={flow.backLink}>
          ← Tilbake
        </Link>
      ) : null}

      <div className={flow.progressRow} aria-hidden>
        {Array.from({ length: stepCount }, (_, i) => (
          <span
            key={i}
            className={`${flow.progressSeg} ${i <= stepIndex ? flow.progressSegActive : ""}`}
          />
        ))}
      </div>

      <div className={flow.stepHead}>
        <p className={flow.stepMeta}>
          Steg {stepIndex + 1} av {stepCount}
        </p>
        <h1 className={flow.stepTitle}>{title}</h1>
        <p className={flow.stepLead}>{lead}</p>
      </div>

      <div ref={stepFocusRef} className={flow.stepBody}>
        {children}
      </div>
    </div>
  );
}
