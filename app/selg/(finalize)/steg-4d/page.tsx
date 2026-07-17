import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { SellFinalizeContactSlide } from "@/app/components/SellCarFinalizeSlides";
import pageStyles from "../../page.module.css";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Legg inn kontaktinformasjon og send inn skjemaet.",
};

export default function SelgSteg4dPage() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <Menu />
      <SellFinalizeContactSlide />
    </div>
  );
}
