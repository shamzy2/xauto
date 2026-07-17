import type { Metadata } from "next";
import Link from "next/link";

import { formatCarPrice } from "@/app/admin/cars/carDisplay";
import {
  buildAnnualFinancialReport,
  detectAvailableReportYears,
  resolveMinReportYear,
} from "@/lib/annualReport";
import { formatAccountingStartNote } from "@/lib/accountingPeriod";
import {
  fetchAccountingSettings,
  fetchCarCosts,
  fetchCars,
  fetchCompanyFinancing,
  fetchFinancingMovements,
  fetchGeneralCosts,
} from "@/lib/server/accounting";

import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Årsregnskap",
};

type StatementRow = {
  label: string;
  amount: number;
  emphasis?: boolean;
  indent?: boolean;
};

function parseReportYear(raw: string | undefined, minYear: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < minYear) {
    return Math.max(minYear, new Date().getFullYear());
  }
  return parsed;
}

function FinancialTable({
  title,
  rows,
}: {
  title: string;
  rows: StatementRow[];
}) {
  return (
    <section className={styles.card}>
      <h2 className={styles.statementTitle}>{title}</h2>
      <table className={styles.statementTable}>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={
                row.emphasis ? styles.statementRowEmphasis : undefined
              }
            >
              <th
                scope="row"
                className={
                  row.indent ? styles.statementLabelIndent : styles.statementLabel
                }
              >
                {row.label}
              </th>
              <td className={styles.statementAmount}>
                {formatCarPrice(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default async function AdminAnnualReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const sp = await searchParams;

  let report;
  let availableYears: number[] = [new Date().getFullYear()];
  let errorMessage: string | null = null;
  let settings;
  let selectedYear = new Date().getFullYear();

  try {
    const [cars, carCosts, generalCosts, fetchedSettings, financingItems, financingMovements] =
      await Promise.all([
      fetchCars(),
      fetchCarCosts(),
      fetchGeneralCosts(),
      fetchAccountingSettings(),
      fetchCompanyFinancing(),
      fetchFinancingMovements(),
    ]);
    settings = fetchedSettings;
    const minYear = resolveMinReportYear(settings);
    selectedYear = parseReportYear(sp.year, minYear);
    availableYears = detectAvailableReportYears(
      cars,
      carCosts,
      generalCosts,
      settings,
    );
    report = buildAnnualFinancialReport(
      cars,
      carCosts,
      generalCosts,
      selectedYear,
      settings,
      financingItems,
      financingMovements,
    );
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : "Kunne ikke generere årsregnskap.";
  }

  const startNote = settings
    ? formatAccountingStartNote(settings.accountingStartDate)
    : null;

  return (
    <>
      <h1 className={styles.h1}>Årsregnskap</h1>
      <p className={styles.muted} style={{ marginBottom: "20px" }}>
        Beregnet regnskap for regnskapsåret {selectedYear} (kun visning, ingen
        lagring).
        {startNote ? <> {startNote}</> : null}
        {report?.metadata.generatedAt ? (
          <>
            {" "}
            Generert{" "}
            {new Date(report.metadata.generatedAt).toLocaleString("nb-NO", {
              timeZone: "Europe/Oslo",
            })}
            .
          </>
        ) : null}
      </p>

      <form className={styles.filters} method="get" style={{ marginBottom: 24 }}>
        <label>
          Regnskapsår
          <select name="year" defaultValue={String(selectedYear)}>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.filterActions}>
          <button type="submit" className={styles.filterBtn}>
            Vis år
          </button>
        </div>
      </form>

      {errorMessage || !report ? (
        <div className={styles.card}>
          <p>Kunne ikke generere årsregnskap.</p>
          <p className={styles.muted}>{errorMessage}</p>
        </div>
      ) : (
        <div className={styles.statementStack}>
          {report.metadata.companyName ? (
            <p className={styles.muted} style={{ margin: 0 }}>
              {report.metadata.companyName}
              {report.metadata.orgNumber
                ? ` · Org.nr. ${report.metadata.orgNumber}`
                : ""}
            </p>
          ) : null}
          <FinancialTable
            title={`Resultatregnskap ${report.metadata.year}`}
            rows={[
              {
                label: "Sum salgsinntekter",
                amount: report.resultatregnskap.salgsinntekter,
              },
              {
                label: "Varekostnad",
                amount: report.resultatregnskap.varekostnad,
                indent: true,
              },
              {
                label: "Andre driftskostnader",
                amount: report.resultatregnskap.andreDriftskostnader,
                indent: true,
              },
              {
                label: "Driftsresultat (EBIT)",
                amount: report.resultatregnskap.driftsresultat,
                emphasis: true,
              },
              {
                label: "Årsresultat",
                amount: report.resultatregnskap.aarsresultat,
                emphasis: true,
              },
            ]}
          />

          <FinancialTable
            title={`MVA-oppsummering ${report.metadata.year}`}
            rows={[
              {
                label: "Inngående MVA (fradrag fra driftskostnader)",
                amount: report.resultatregnskap.inngaaendeMva,
              },
              {
                label: "Utgående MVA (bilsalg — ikke sporet i systemet)",
                amount: report.resultatregnskap.utgaaendeMva,
                indent: true,
              },
              {
                label: report.balanse.mvaGjeld > 0 ? "Skyldig MVA" : "MVA til gode",
                amount:
                  report.balanse.mvaGjeld > 0
                    ? report.balanse.mvaGjeld
                    : report.balanse.mvaFordring,
                emphasis: true,
              },
            ]}
          />

          <FinancialTable
            title={`Balanse per 31.12.${report.metadata.year}`}
            rows={[
              {
                label: "Varelager",
                amount: report.balanse.varelager,
              },
              {
                label: "Bankinnskudd",
                amount: report.balanse.bankBalance,
                indent: true,
              },
              {
                label: "MVA-fordring (driftskostnader)",
                amount: report.balanse.mvaFordring,
                indent: true,
              },
              {
                label: "Sum omløpsmidler",
                amount: report.balanse.sumOmlopsmidler,
                emphasis: true,
              },
              {
                label: "Sum eiendeler",
                amount: report.balanse.sumEiendeler,
                emphasis: true,
              },
              {
                label: "Leverandørgjeld",
                amount: report.balanse.accountsPayable,
              },
              {
                label: "Aksjonærlån",
                amount: report.balanse.shareholderLoans,
                indent: true,
              },
              {
                label: "Kassekreditt",
                amount: report.balanse.bankCredit,
                indent: true,
              },
              {
                label: "Banklån",
                amount: report.balanse.bankLoans,
                indent: true,
              },
              {
                label: "Skyldig MVA",
                amount: report.balanse.mvaGjeld,
                indent: true,
              },
              {
                label: "Sum gjeld",
                amount: report.balanse.sumGjeld,
                emphasis: true,
              },
              {
                label: "Inngående egenkapital",
                amount: report.balanse.inngaaendeEgenkapital,
              },
              {
                label: "Årets resultat",
                amount: report.balanse.aarsresultat,
                indent: true,
              },
              {
                label: "Sum egenkapital",
                amount: report.balanse.sumEgenkapital,
                emphasis: true,
              },
              {
                label: "Sum egenkapital og gjeld",
                amount: report.balanse.sumEgenkapitalOgGjeld,
                emphasis: true,
              },
            ]}
          />

          {report.metadata.complianceNotes.length > 0 ? (
            <section className={styles.card}>
              <h2 className={styles.statementTitle}>Merknader</h2>
              <ul className={styles.muted} style={{ margin: 0, paddingLeft: 20 }}>
                {report.metadata.complianceNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {report.metadata.validation.warnings.length > 0 ? (
            <section className={styles.card}>
              <h2 className={styles.statementTitle}>Kontrollvarsel</h2>
              <ul className={styles.formError} style={{ margin: 0, paddingLeft: 20 }}>
                {report.metadata.validation.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className={styles.muted}>
            <Link className={styles.backLink} href="/admin/dashboard">
              ← Dashboard
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
