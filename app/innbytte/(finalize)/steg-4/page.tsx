import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { SellFinalizePriceSlide } from "@/app/components/SellCarFinalizeSlides";
import pageStyles from "../../../selg/page.module.css";

export const metadata: Metadata = {
  title: "Innbytteverdi",
  description: "Oppgi forventning til innbytteverdi.",
};

export default function InnbytteSteg4Page() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <Menu />
      <SellFinalizePriceSlide />
    </div>
  );
}
