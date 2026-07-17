import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { SellFinalizePriceSlide } from "@/app/components/SellCarFinalizeSlides";
import pageStyles from "../../page.module.css";

export const metadata: Metadata = {
  title: "Oppkjøpspris",
  description: "Oppgi eventuell forventning til oppkjøpspris.",
};

export default function SelgSteg4Page() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <Menu />
      <SellFinalizePriceSlide />
    </div>
  );
}
