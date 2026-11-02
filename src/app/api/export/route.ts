import { and, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { categories, transactions } from "@/db/schema";
import { getRequestI18n } from "@/i18n/request";
import { toCsv } from "@/lib/csv";
import { isValidMonth, monthRange } from "@/lib/dates";
import { db } from "@/lib/db";
import { centsToInput } from "@/lib/money";
import { getSessionUserId } from "@/lib/session";

// GET /api/export            -> every transaction
// GET /api/export?month=YYYY-MM -> one month
export async function GET(request: NextRequest) {
  // The proxy skips /api routes, so this handler checks the session itself
  const userId = await getSessionUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const month = request.nextUrl.searchParams.get("month");
  const conditions: SQL[] = [eq(transactions.userId, userId)];
  if (isValidMonth(month)) {
    const { start, end } = monthRange(month);
    conditions.push(gte(transactions.date, start), lt(transactions.date, end));
  }

  const rows = await db
    .select({
      date: transactions.date,
      type: categories.type,
      category: categories.name,
      amount: transactions.amount,
      note: transactions.note,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  const { t } = await getRequestI18n();
  const csv = toCsv(
    [t("csv.date"), t("csv.type"), t("csv.category"), t("csv.amount"), t("csv.note")],
    rows.map((row) => [
      row.date,
      row.type === "INCOME" ? t("csv.income") : t("csv.expense"),
      row.category,
      // Signed, so a spreadsheet SUM gives the net
      `${row.type === "EXPENSE" ? "-" : ""}${centsToInput(row.amount)}`,
      row.note,
    ]),
    [2, 4], // category and note are user-entered text
  );

  const filename = `transactions-${isValidMonth(month) ? month : "all"}.csv`;
  // The BOM makes Excel open the file as UTF-8
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
