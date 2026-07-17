import Link from "next/link";

import { BrandLogo } from "@/app/components/BrandLogo";

import { AdminPanelNav } from "../../components/AdminPanelNav";
import { AdminLogoutButton } from "../../AdminLogoutButton";
import styles from "../../admin.module.css";

export default function AccountingSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className={styles.topBar}>
        <Link className={styles.brandLogo} href="/admin/dashboard">
          <BrandLogo clipPathId="admin-settings-logo-clip" />
        </Link>
        <AdminLogoutButton />
      </header>
      <AdminPanelNav />
      {children}
    </>
  );
}
