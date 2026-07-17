import type { Metadata } from "next";
import { Menu } from "../../components/Menu";
import { SellFlowPickupStep } from "../../components/SellFlowPickupStep";
import pageStyles from "../page.module.css";

export const metadata: Metadata = {
  title: "Henteadresse",
  description: "Oppgi hvor bilen står.",
};

export default function SelgSteg2aPage() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <Menu />
      <SellFlowPickupStep />
    </div>
  );
}
