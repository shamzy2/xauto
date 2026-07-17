import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { Menu } from "@/app/components/Menu";
import showcase from "@/app/showcase.module.css";

import { VareBilerFinn } from "./VareBilerFinn";
import { VareBilerHero } from "./VareBilerHero";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Våre biler",
  description:
    "Se biler til salgs og start innbytte: oppgi reg.nr. og kilometer, og fortsett til innbytteskjemaet hos X Auto på Fetsund.",
};

export default function VareBilerPage() {
  return (
    <div className={showcase.pageShell}>
      <Menu />
      <section className={`${showcase.subHero} ${showcase.subHeroUnderNav}`} aria-labelledby="vare-biler-title">
        <div className={showcase.subHeroBg}>
          <Image
            src="/lambo.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className={styles.heroImg}
          />
        </div>
        <div className={showcase.subHeroShade} aria-hidden />
        <div className={showcase.subHeroInner}>
          <p className={showcase.subHeroEyebrow}>X Auto AS</p>
          <h1 id="vare-biler-title" className={showcase.subHeroTitle}>
            Våre biler
          </h1>
          <p className={showcase.subHeroLead}>
            Se lageret vårt og start innbytte med reg.nr og kilometerstand.
          </p>
        </div>
      </section>

      <div className={showcase.contentBand}>
        <div className={showcase.contentBandInner}>
          <Suspense fallback={null}>
            <VareBilerHero />
          </Suspense>
          <VareBilerFinn />
        </div>
      </div>
    </div>
  );
}
