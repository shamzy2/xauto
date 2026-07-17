"use client";

import { FormEvent, useRef, useState } from "react";

import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import flow from "@/app/components/sellFlowShared.module.css";

import styles from "./KontaktForm.module.css";

type Status = "idle" | "submitting" | "success" | "error";

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 19.5c0-3.5 3.5-6.5 7-6.5s7 3 7 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6h16v12H4V6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8.5 3h2l1.5 5.5-2 1.2a11 11 0 005.3 5.3l1.2-2L20 14.5v2c0 1-1 2-2 2h-1C10.4 20 4 13.6 4 5.5 4 4.5 5 3.5 6 3.5h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KontaktForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    setErrorMessage(null);
    setStatus("submitting");

    try {
      const res = await fetch("/api/kontakt/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const json = await readJsonResponseBody<{
        error?: string;
        hint?: string;
        ok?: boolean;
      }>(res);

      if (!res.ok) {
        const hint =
          typeof json.hint === "string" && json.hint.trim() ? ` ${json.hint}` : "";
        setErrorMessage(
          (typeof json.error === "string" && json.error.trim()
            ? json.error
            : "Kunne ikke sende henvendelsen.") + hint,
        );
        setStatus("error");
        return;
      }

      formRef.current?.reset();
      setStatus("success");
    } catch {
      setErrorMessage("Nettverksfeil. Prøv igjen om litt.");
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={(ev) => void onSubmit(ev)}
      className={styles.form}
      aria-label="Kontaktskjema"
    >
      {status === "success" ? (
        <p className={styles.bannerSuccess} role="status">
          Takk, henvendelsen er sendt. Vi tar kontakt så snart vi kan.
        </p>
      ) : null}
      {status === "error" && errorMessage ? (
        <p className={flow.formError} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className={flow.fieldPanel}>
        <div className={flow.inputWithIcon}>
          <PersonIcon className={flow.fieldIcon} />
          <label className={flow.srOnly} htmlFor="kontakt-name">
            Navn
          </label>
          <input
            id="kontakt-name"
            name="name"
            required
            autoComplete="name"
            className={`${flow.textInput} ${flow.textInputPadded}`}
            placeholder="Fullt navn"
            disabled={status === "submitting"}
          />
        </div>

        <div className={flow.inputWithIcon}>
          <EmailIcon className={flow.fieldIcon} />
          <label className={flow.srOnly} htmlFor="kontakt-email">
            E-post
          </label>
          <input
            id="kontakt-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className={`${flow.textInput} ${flow.textInputPadded}`}
            placeholder="E-postadresse"
            disabled={status === "submitting"}
          />
        </div>

        <div className={flow.inputWithIcon}>
          <PhoneIcon className={flow.fieldIcon} />
          <label className={flow.srOnly} htmlFor="kontakt-phone">
            Telefon (valgfritt)
          </label>
          <input
            id="kontakt-phone"
            name="phone"
            autoComplete="tel"
            className={`${flow.textInput} ${flow.textInputPadded}`}
            placeholder="Mobilnummer (valgfritt)"
            disabled={status === "submitting"}
          />
        </div>

        <label className={flow.fieldLabel} htmlFor="kontakt-message">
          Melding
        </label>
        <textarea
          id="kontakt-message"
          name="message"
          required
          rows={6}
          className={flow.textarea}
          placeholder="Skriv kort hva du trenger hjelp med."
          disabled={status === "submitting"}
        />
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={flow.flowBtnPrimary}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sender…" : "Send henvendelse"}
        </button>
      </div>
    </form>
  );
}
