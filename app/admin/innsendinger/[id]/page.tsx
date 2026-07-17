import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { AdminSubmissionRow } from "@/lib/server/adminSubmissionFormatting";

import styles from "../../admin.module.css";
import { SubmissionAdminView } from "../submissionAdminView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Innsending ${id.slice(0, 8)}…` };
}

export default async function AdminSubmissionDetailPage({
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

  const { data: sellRow, error: sellErr } = await supabase
    .from("sell_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (sellErr) {
    notFound();
  }

  let r: AdminSubmissionRow;
  let listBackHref = "/admin/innsendinger";

  if (sellRow) {
    r = sellRow as AdminSubmissionRow;
    if (!r.admin_opened_at) {
      await supabase
        .from("sell_submissions")
        .update({
          admin_opened_at: new Date().toISOString(),
          admin_opened_by: user.id,
        })
        .eq("id", id);
      r.admin_opened_at = new Date().toISOString();
      r.admin_opened_by = user.id;
    }
  } else {
    const { data: innRow, error: innErr } = await supabase
      .from("innbytte_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (innErr || !innRow) {
      notFound();
    }

    r = innRow as AdminSubmissionRow;
    listBackHref = "/admin/innsendinger/innbytte";

    if (!r.admin_opened_at) {
      await supabase
        .from("innbytte_submissions")
        .update({
          admin_opened_at: new Date().toISOString(),
          admin_opened_by: user.id,
        })
        .eq("id", id);
      r.admin_opened_at = new Date().toISOString();
      r.admin_opened_by = user.id;
    }
  }

  return (
    <>
      <p className={styles.topBack}>
        <Link className={styles.backLink} href={listBackHref}>
          ← Listen
        </Link>
      </p>
      <SubmissionAdminView row={r} />
    </>
  );
}
