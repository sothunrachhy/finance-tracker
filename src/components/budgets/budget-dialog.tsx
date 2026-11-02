"use client";

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
import { formatMonth } from "@/lib/dates";
import type { FormState } from "@/lib/form-state";
import { centsToInput } from "@/lib/money";
import { saveBudget } from "@/server/actions/budgets";

type CategoryChoice = { id: string; name: string };

type BudgetDialogProps = {
  month: string;
  /** Categories the user can pick from (expense categories without a budget yet) */
  categories: CategoryChoice[];
  /** Fixes the category, for editing or "set budget" shortcuts */
  category?: CategoryChoice;
  amount?: number;
  triggerProps?: ComponentProps<typeof Button>;
  children: ReactNode;
};

export function BudgetDialog({ triggerProps, children, ...props }: BudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const editing = props.amount !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button {...triggerProps} />}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit budget" : "Set a budget"}</DialogTitle>
          <DialogDescription>
            Monthly spending limit for {formatMonth(props.month)}.
          </DialogDescription>
        </DialogHeader>
        {open && <BudgetForm {...props} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function BudgetForm({
  month,
  categories,
  category,
  amount,
  onSaved,
}: Omit<BudgetDialogProps, "triggerProps" | "children"> & { onSaved: () => void }) {
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await saveBudget(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      onSaved();
    }
    return result;
  }, undefined);

  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormMessage message={state?.ok ? undefined : state?.message} />
      <input type="hidden" name="month" value={month} />

      <FormField label="Category" name="categoryId" errors={errors?.categoryId}>
        {category ? (
          <>
            <input type="hidden" name="categoryId" value={category.id} />
            <p className="text-sm font-medium">{category.name}</p>
          </>
        ) : (
          <NativeSelect
            id="categoryId"
            name="categoryId"
            className="w-full"
            defaultValue={state?.values?.categoryId ?? ""}
            aria-invalid={Boolean(errors?.categoryId) || undefined}
          >
            <NativeSelectOption value="" disabled>
              Choose a category
            </NativeSelectOption>
            {categories.map((c) => (
              <NativeSelectOption key={c.id} value={c.id}>
                {c.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </FormField>

      <FormField
        label="Monthly limit"
        name="amount"
        inputMode="decimal"
        placeholder="0.00"
        autoFocus
        defaultValue={state?.values?.amount ?? (amount !== undefined ? centsToInput(amount) : "")}
        errors={errors?.amount}
      />

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <SubmitButton>Save budget</SubmitButton>
      </DialogFooter>
    </form>
  );
}
