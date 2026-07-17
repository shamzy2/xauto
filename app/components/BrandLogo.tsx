import Image from "next/image";

import styles from "./BrandLogo.module.css";

type LogoVariant = "default" | "onDark";

/** X Auto ordmerke — `/xauto.svg`. */
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
      src="/xauto.svg"
      alt="X Auto AS"
      width={1967}
      height={560}
      className={[styles.logo, variant === "onDark" ? styles.onDark : styles.onLight, className]
        .filter(Boolean)
        .join(" ")}
      priority
    />
  );
}
