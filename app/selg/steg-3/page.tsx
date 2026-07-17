import type { Metadata } from "next";
import { Menu } from "../../components/Menu";
import { SellCarStep3 } from "../../components/SellCarStep3";
import pageStyles from "../page.module.css";

export const metadata: Metadata = {
  title: "Service og utstyr",
  description:
    "Oppgi servicehistorikk, siste service og utstyr for en mer presis vurdering.",
};

export default function SelgSteg3Page() {
  return (
    <>
      <div className={pageStyles.flowPageSteps}>
        <Menu />
        <SellCarStep3 />
      </div>
    </>
  );
}
