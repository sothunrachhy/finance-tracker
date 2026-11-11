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
import { useI18n } from "@/i18n/client";
import type { FormState } from "@/lib/form-state";
import { centsToInput, currencyDecimals } from "@/lib/money";
import { saveBudget } from "@/server/actions/budgets";

type CategoryChoice = { id: string; name: string };

type BudgetDialogProps = {
  month: string;
  /** Categories the user can pick from (expense categories without a budget yet) */
  categories: CategoryChoice[];
  /** Fixes the category, for editing or "set budget" shortcuts */
  category?: CategoryChoice;
  amount?: number;
  /** The user's currency: riel is entered in whole numbers */
  currency: string;
  triggerProps?: ComponentProps<typeof Button>;
  children: ReactNode;
};

export function BudgetDialog({ triggerProps, children, ...props }: BudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const editing = props.amount !== undefined;
  const { locale, t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button {...triggerProps} />}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? t("budgets.editTitle") : t("budgets.setTitle")}</DialogTitle>
          <DialogDescription>
            {t("budgets.dialogDescription", {
              month: formatMonth(props.month, "long", locale),
            })}
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
  currency,
  onSaved,
}: Omit<BudgetDialogProps, "triggerProps" | "children"> & { onSaved: () => void }) {
  const { t } = useI18n();
  const decimals = currencyDecimals(currency);
  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await saveBudget(prev, formData);
      if (result?.ok) {
        toast.success(result.message);
        onSaved();
      }
      return result;
    },
    undefined,
  );

  const errors = state?.fieldErrors;

  return (
    <form action={formAction} noValidate>
      {/* Disabled while saving: React resets the form when the action returns, which
          would wipe anything typed in the meantime */}
      <fieldset disabled={pending} className="grid gap-4">
        <FormMessage message={state?.ok ? undefined : state?.message} />
        <input type="hidden" name="month" value={month} />

        <FormField label={t("transactions.category")} name="categoryId" errors={errors?.categoryId}>
          {({ invalid }) =>
            category ? (
              <>
                <input type="hidden" name="categoryId" value={category.id} />
                <p className="text-sm font-medium">{category.name}</p>
              </>
            ) : (
              <NativeSelect
                // Remount after a failed submit so the chosen category is restored
                key={state?.values?.categoryId}
                id="categoryId"
                name="categoryId"
                className="w-full"
                defaultValue={state?.values?.categoryId ?? ""}
                aria-invalid={invalid || undefined}
              >
                <NativeSelectOption value="" disabled>
                  {t("transactions.chooseCategory")}
                </NativeSelectOption>
                {categories.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )
          }
        </FormField>

        <FormField
          label={t("budgets.limit")}
          name="amount"
          inputMode={decimals === 0 ? "numeric" : "decimal"}
          placeholder={decimals === 0 ? "0" : "0.00"}
          autoFocus
          defaultValue={
            state?.values?.amount ?? (amount !== undefined ? centsToInput(amount, decimals) : "")
          }
          errors={errors?.amount}
        />

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t("common.cancel")}</DialogClose>
          <SubmitButton>{t("budgets.save")}</SubmitButton>
        </DialogFooter>
      </fieldset>
    </form>
  );
}
