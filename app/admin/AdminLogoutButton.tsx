"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "./admin.module.css";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button className={styles.logout} type="button" onClick={() => void logout()}>
      Logg ut
    </button>
  );
}
