"use client";

import Link from "next/link";
import { type ComponentProps, type ReactNode, useActionState, useState } from "react";
import { toast } from "sonner";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { FormState } from "@/lib/form-state";
import { centsToInput } from "@/lib/money";
import { cn } from "@/lib/utils";
import { saveTransaction } from "@/server/actions/transactions";
import type { CategoryOption } from "@/server/queries/categories";
import type { TransactionRow } from "@/server/queries/transactions";

type TransactionDialogProps = {
  categories: CategoryOption[];
  today: string;
  /** Pass an existing transaction to edit it; omit to add a new one. */
  transaction?: TransactionRow;
  triggerProps?: ComponentProps<typeof Button>;
  children: ReactNode;
};

export function TransactionDialog({
  categories,
  today,
  transaction,
  triggerProps,
  children,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button {...triggerProps} />}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Update the details below." : "Record money coming in or going out."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every open starts with a fresh form */}
        {open && (
          <TransactionForm
            categories={categories}
            today={today}
            transaction={transaction}
            onSaved={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  categories,
  today,
  transaction,
  onSaved,
}: Omit<TransactionDialogProps, "triggerProps" | "children"> & { onSaved: () => void }) {
  const [type, setType] = useState<"EXPENSE" | "INCOME">(transaction?.categoryType ?? "EXPENSE");
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await saveTransaction(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      onSaved();
    }
    return result;
  }, undefined);

  const options = categories.filter((c) => c.type === type);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormMessage message={state?.ok ? undefined : state?.message} />
      {transaction && <input type="hidden" name="id" value={transaction.id} />}

      <div
        className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1"
        role="group"
        aria-label="Type"
      >
        {(["EXPENSE", "INCOME"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            aria-pressed={type === value}
            className={cn(
              "rounded-md py-1.5 text-sm font-medium transition-colors",
              type === value
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "EXPENSE" ? "Expense" : "Income"}
          </button>
        ))}
      </div>

      <FormField
        label="Amount"
        name="amount"
        inputMode="decimal"
        placeholder="0.00"
        autoFocus
        defaultValue={
          state?.values?.amount ?? (transaction ? centsToInput(transaction.amount) : "")
        }
        errors={errors?.amount}
      />

      <FormField label="Category" name="categoryId" errors={errors?.categoryId}>
        {options.length > 0 ? (
          <NativeSelect
            // Remount when the type changes so the selection resets
            key={type}
            id="categoryId"
            name="categoryId"
            className="w-full"
            defaultValue={
              state?.values?.categoryId ??
              (transaction?.categoryType === type ? transaction.categoryId : "")
            }
            aria-invalid={Boolean(errors?.categoryId) || undefined}
          >
            <NativeSelectOption value="" disabled>
              Choose a category
            </NativeSelectOption>
            {options.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        ) : (
          <p className="text-muted-foreground text-sm">
            No {type.toLowerCase()} categories yet.{" "}
            <Link href="/categories" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
          </p>
        )}
      </FormField>

      <FormField
        label="Date"
        name="date"
        type="date"
        defaultValue={state?.values?.date ?? transaction?.date ?? today}
        errors={errors?.date}
      />

      <FormField
        label="Note"
        name="note"
        placeholder="Optional, e.g. Lunch with team"
        maxLength={200}
        defaultValue={state?.values?.note ?? transaction?.note ?? ""}
        errors={errors?.note}
      />

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <SubmitButton>{transaction ? "Save changes" : "Add transaction"}</SubmitButton>
      </DialogFooter>
    </form>
  );
}
