import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Logg inn (admin) - X Bilsenter AS" },
};

export default function AdminLoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
