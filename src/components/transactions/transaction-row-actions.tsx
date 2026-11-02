"use client";

import { Pencil } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { useI18n } from "@/i18n/client";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { deleteTransaction } from "@/server/actions/transactions";
import type { CategoryOption } from "@/server/queries/categories";
import type { TransactionRow } from "@/server/queries/transactions";
import { TransactionDialog } from "./transaction-dialog";

export function TransactionRowActions({
  transaction,
  categories,
  today,
  currency,
}: {
  transaction: TransactionRow;
  categories: CategoryOption[];
  today: string;
  currency: string;
}) {
  const { locale, t } = useI18n();
  const name = transaction.note ?? transaction.categoryName;

  return (
    <div className="flex justify-end gap-1">
      <TransactionDialog
        categories={categories}
        today={today}
        transaction={transaction}
        triggerProps={{
          variant: "ghost",
          size: "icon-sm",
          "aria-label": t("transactions.editLabel", { name }),
          title: t("common.edit"),
        }}
      >
        <Pencil />
      </TransactionDialog>
      <ConfirmDeleteButton
        label={t("transactions.deleteLabel", { name })}
        title={t("transactions.deleteTitle", { name })}
        description={t("transactions.deleteDescription", {
          amount: formatMoney(transaction.amount, currency, { locale }),
          date: formatDate(transaction.date, locale),
        })}
        onConfirm={() => deleteTransaction(transaction.id)}
      />
    </div>
  );
}
