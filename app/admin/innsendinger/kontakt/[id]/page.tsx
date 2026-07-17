import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import styles from "../../../admin.module.css";
import {
  ContactSubmissionAdminView,
  type ContactSubmissionRow,
} from "../ContactSubmissionAdminView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Kontakt ${id.slice(0, 8)}…` };
}

export default async function AdminKontaktSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data: row, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const r = row as ContactSubmissionRow;

  if (!r.admin_opened_at) {
    await supabase
      .from("contact_submissions")
      .update({
        admin_opened_at: new Date().toISOString(),
        admin_opened_by: user.id,
      })
      .eq("id", id);
    r.admin_opened_at = new Date().toISOString();
  }

  return (
    <>
      <p className={styles.topBack}>
        <Link className={styles.backLink} href="/admin/innsendinger/kontakt">
          ← Kontakt-henvendelser
        </Link>
      </p>
      <ContactSubmissionAdminView row={r} />
    </>
  );
}
