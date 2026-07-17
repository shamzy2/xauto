import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { SellFinalizeAdditionalSlide } from "@/app/components/SellCarFinalizeSlides";
import pageStyles from "../../../selg/page.module.css";

export const metadata: Metadata = {
  title: "Tillegg",
  description: "Valgfri merknad før du legger inn kontaktinformasjon.",
};

export default function InnbytteSteg4cPage() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <Menu />
      <SellFinalizeAdditionalSlide />
    </div>
  );
}
