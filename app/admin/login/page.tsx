"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useState,
  Suspense,
} from "react";

import { createClient } from "@/lib/supabase/client";

import styles from "./login.module.css";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin/innsendinger";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!cancelled && data.user) {
          router.replace(redirectTo);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, redirectTo]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.root}>
      <h1 className={styles.title}>Admin</h1>
      <p className={styles.sub}>Logg inn for å se innsendinger fra selgeskjema.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          E-post
          <input
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Passord
          <input
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
          />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "Logger inn…" : "Logg inn"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
