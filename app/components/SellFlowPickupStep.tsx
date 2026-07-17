"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  persistPickupAddress,
  readPickupAddress,
} from "@/app/lib/sellPickupAddressStorage";
import {
  SELL_FLOW_STEPS,
  SELL_FLOW_WIZARD_STEP_COUNT,
} from "@/lib/sellFlowSteps";
import { isPickupAddressComplete } from "@/lib/types/pickupAddress";
import { FlowPhotoUpload } from "./FlowPhotoUpload";
import { PickupAddressFields } from "./PickupAddressFields";
import { SellFlowPageShell } from "./SellFlowPageShell";
import { SellFlowWizardChrome } from "./SellFlowWizardChrome";
import { useSellFlowRoute } from "./SellFlowRouteContext";
import flow from "./sellFlowShared.module.css";

export function SellFlowPickupStep() {
  const router = useRouter();
  const { basePath } = useSellFlowRoute();
  const flowKind = basePath === "/innbytte" ? "innbytte" : "sell";
  const [address, setAddress] = useState(readPickupAddress(flowKind));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistPickupAddress(flowKind, address);
  }, [address, flowKind]);

  const stepIndex = 0;
  const step = SELL_FLOW_STEPS[stepIndex]!;

  function onContinue() {
    if (!isPickupAddressComplete(address)) {
      setError("Velg en gyldig adresse fra listen.");
      return;
    }
    setError(null);
    persistPickupAddress(flowKind, address);
    router.push(`${basePath}/steg-2b`);
  }

  return (
    <SellFlowPageShell>
      <SellFlowWizardChrome
        stepIndex={stepIndex}
        stepCount={SELL_FLOW_WIZARD_STEP_COUNT}
        title={step.title}
        lead={step.lead}
      >
        <div className={flow.flowSection}>
          <PickupAddressFields address={address} onChange={setAddress} />
          {error ? (
            <p className={flow.formError} role="alert">
              {error}
            </p>
          ) : null}
          <FlowPhotoUpload />
        </div>

        <div className={flow.flowNav}>
          <Link href={basePath} className={flow.flowBtnGhost}>
            Tilbake
          </Link>
          <button type="button" className={flow.flowBtnPrimary} onClick={onContinue}>
            Neste →
          </button>
        </div>
      </SellFlowWizardChrome>
    </SellFlowPageShell>
  );
}
