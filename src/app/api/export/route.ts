import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { categories, transactions } from "@/db/schema";
import { getRequestI18n } from "@/i18n/request";
import { getUserIdOrNull } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { parseTransactionFilters } from "@/lib/filters";
import { centsToInput } from "@/lib/money";
import { categoryName } from "@/server/queries/category-name";
import { transactionFilterConditions } from "@/server/queries/transactions";

// GET /api/export                              -> every transaction
// GET /api/export?month=2026-10&type=income&q= -> same filters as the transactions page
export async function GET(request: NextRequest) {
  // The proxy skips /api routes, so this handler checks the session itself
  const userId = await getUserIdOrNull();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { locale, t } = await getRequestI18n();
  const params = Object.fromEntries(request.nextUrl.searchParams);
  // Unlike the page, no month means the whole history
  const filters = parseTransactionFilters({ ...params, month: params.month ?? "all" });

  const rows = await db
    .select({
      date: transactions.date,
      type: categories.type,
      category: categoryName(locale),
      amount: transactions.amount,
      note: transactions.note,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(transactionFilterConditions(userId, filters, locale))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

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

  const filename = `transactions-${filters.month}.csv`;
  // The BOM makes Excel open the file as UTF-8
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
