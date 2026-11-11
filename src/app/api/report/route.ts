import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { categories, transactions, users } from "@/db/schema";
import { getRequestI18n } from "@/i18n/request";
import { getUserIdOrNull } from "@/lib/auth";
import { currentMonth, isValidMonth, todayISO } from "@/lib/dates";
import { db } from "@/lib/db";
import { parseTransactionFilters } from "@/lib/filters";
import { renderStatement } from "@/server/report/statement";
import { getBudgetsWithSpending } from "@/server/queries/budgets";
import { categoryName } from "@/server/queries/category-name";
import { getMonthSummary, getSpendingByCategory } from "@/server/queries/dashboard";
import { transactionFilterConditions } from "@/server/queries/transactions";

// GET /api/report?month=2026-10 -> a PDF statement for that month (default: this month)
export async function GET(request: NextRequest) {
  // The proxy skips /api routes, so this handler checks the session itself
  const userId = await getUserIdOrNull();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { locale, t } = await getRequestI18n();
  const requested = request.nextUrl.searchParams.get("month");
  const month = isValidMonth(requested) ? requested : currentMonth();
  const filters = parseTransactionFilters({ month });

  const [[user], summary, spending, budgets, rows] = await Promise.all([
    db
      .select({ name: users.name, email: users.email, currency: users.currency })
      .from(users)
      .where(eq(users.id, userId)),
    getMonthSummary(userId, month),
    getSpendingByCategory(userId, month, locale),
    getBudgetsWithSpending(userId, month, locale),
    db
      .select({
        id: transactions.id,
        date: transactions.date,
        type: categories.type,
        category: categoryName(locale),
        color: categories.color,
        amount: transactions.amount,
        note: transactions.note,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(transactionFilterConditions(userId, filters, locale))
      .orderBy(desc(transactions.date), desc(transactions.createdAt)),
  ]);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const pdf = await renderStatement(
    { user, month, generatedOn: todayISO(), summary, spending, budgets, transactions: rows },
    locale,
    t,
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="statement-${month}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
