"use client";

import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { isValidMonth } from "@/lib/dates";

const CLASS_NAME =
  "inline-flex h-9 items-center justify-center rounded-full bg-linear-to-r from-teal-800 to-emerald-700 text-sm font-semibold text-white shadow-md shadow-emerald-800/20 transition hover:brightness-110";

/**
 * Downloads the PDF statement for the month the page shows (?month=), or this month.
 * A plain link: the browser saves the file the route returns.
 */
export function ReportLink() {
  const { t } = useI18n();
  const month = useSearchParams().get("month");
  const href = isValidMonth(month) ? `/api/report?month=${month}` : "/api/report";
  return (
    <a href={href} download className={CLASS_NAME}>
      {t("nav.exportButton")}
    </a>
  );
}

/** Shown while the URL is read: the same link for this month */
export function ReportLinkFallback() {
  const { t } = useI18n();
  return (
    <a href="/api/report" download className={CLASS_NAME}>
      {t("nav.exportButton")}
    </a>
  );
}
