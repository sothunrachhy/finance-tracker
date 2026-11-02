"use client";

import { Pencil } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteTransaction } from "@/server/actions/transactions";
import type { CategoryOption } from "@/server/queries/categories";
import type { TransactionRow } from "@/server/queries/transactions";
import { TransactionDialog } from "./transaction-dialog";

export function TransactionRowActions({
  transaction,
  categories,
  today,
}: {
  transaction: TransactionRow;
  categories: CategoryOption[];
  today: string;
}) {
  const label = transaction.note ?? transaction.categoryName;

  return (
    <div className="flex justify-end gap-1">
      <TransactionDialog
        categories={categories}
        today={today}
        transaction={transaction}
        triggerProps={{
          variant: "ghost",
          size: "icon-sm",
          "aria-label": `Edit ${label}`,
          title: "Edit",
        }}
      >
        <Pencil />
      </TransactionDialog>
      <ConfirmDeleteButton
        label={`Delete ${label}`}
        title="Delete this transaction?"
        description="This can't be undone."
        onConfirm={() => deleteTransaction(transaction.id)}
      />
    </div>
  );
}
