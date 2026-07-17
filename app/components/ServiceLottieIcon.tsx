"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

type Props = {
  animationData: object;
  className?: string;
};

export function ServiceLottieIcon({ animationData, className }: Props) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Lottie
      animationData={animationData}
      loop={!reducedMotion}
      autoplay={!reducedMotion}
      className={className}
      aria-hidden
    />
  );
}
