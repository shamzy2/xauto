import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Skjul dev-badge («N») på localhost — vises ikke i produksjon uansett. */
  devIndicators: false,
};

export default nextConfig;
