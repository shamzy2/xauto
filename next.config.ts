import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Skjul dev-badge («N») på localhost — vises ikke i produksjon uansett. */
  devIndicators: false,
  async redirects() {
    return [
      { source: "/tjenester", destination: "/om-oss", permanent: true },
      { source: "/tjenester/:path*", destination: "/om-oss/:path*", permanent: true },
      { source: "/vare-biler", destination: "/biler", permanent: true },
      { source: "/vare-biler/:path*", destination: "/biler/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
