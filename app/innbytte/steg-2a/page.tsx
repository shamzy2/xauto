import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { SellFlowPickupStep } from "@/app/components/SellFlowPickupStep";
import pageStyles from "../../selg/page.module.css";

export const metadata: Metadata = {
  title: "Henteadresse",
  description: "Oppgi hvor bilen står.",
};

export default function InnbytteSteg2aPage() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <Menu />
      <SellFlowPickupStep />
    </div>
  );
}
