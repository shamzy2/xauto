import Link from "next/link";

import { BrandLogo } from "@/app/components/BrandLogo";

import { AdminPanelNav } from "../components/AdminPanelNav";
import { AdminInnsendingerSegmentRefresh } from "../components/AdminInnsendingerSegmentRefresh";
import { AdminLogoutButton } from "../AdminLogoutButton";
import styles from "../admin.module.css";

export default function AdminInnsendingerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminInnsendingerSegmentRefresh />
      <header className={styles.topBar}>
        <Link
          className={styles.brandLogo}
          href="/admin/innsendinger"
          aria-label="X Bilsenter, innsendinger (admin)"
        >
          <BrandLogo clipPathId="admin-innsendinger-logo-clip" />
        </Link>
        <AdminLogoutButton />
      </header>
      <AdminPanelNav />
      {children}
    </>
  );
}
