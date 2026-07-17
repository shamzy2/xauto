import Image from "next/image";

import styles from "./BrandLogo.module.css";

type LogoVariant = "default" | "onDark";

/** X Bilsenter ordmerke — `/x-logo.png`. */
export function BrandLogo({
  clipPathId: _clipPathId,
  variant = "default",
  className,
}: {
  /** @deprecated Ikke i bruk — beholdes for bakoverkompatibilitet. */
  clipPathId?: string;
  variant?: LogoVariant;
  className?: string;
}) {
  return (
    <Image
      src="/x-logo.png"
      alt="X Bilsenter"
      width={920}
      height={100}
      className={[styles.logo, variant === "onDark" ? styles.onDark : styles.onLight, className]
        .filter(Boolean)
        .join(" ")}
      priority
    />
  );
}
