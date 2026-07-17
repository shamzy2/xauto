import type { Metadata } from "next";
import { Suspense } from "react";
import { Menu } from "../../components/Menu";
import { SellCarStep2b } from "../../components/SellCarStep2b";
import pageStyles from "../page.module.css";

export const metadata: Metadata = {
  title: "Dekk",
  description: "Oppgi dekktilstand og om bilen har skader.",
};

export default function SelgSteg2bPage() {
  return (
    <>
      <div className={pageStyles.flowPageSteps}>
        <Menu />
        <Suspense fallback={null}>
          <SellCarStep2b />
        </Suspense>
      </div>
    </>
  );
}
