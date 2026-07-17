import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { SellCarStep3 } from "@/app/components/SellCarStep3";
import pageStyles from "../../selg/page.module.css";

export const metadata: Metadata = {
  title: "Service og utstyr",
  description:
    "Oppgi servicehistorikk, siste service og utstyr for en mer presis vurdering.",
};

export default function InnbytteSteg3Page() {
  return (
    <>
      <div className={pageStyles.flowPageSteps}>
        <Menu />
        <SellCarStep3 />
      </div>
    </>
  );
}
