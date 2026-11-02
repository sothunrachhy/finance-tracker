"use client";

import { type ComponentProps, type ReactNode, useActionState, useState } from "react";
import { toast } from "sonner";
import { CATEGORY_ICONS } from "@/components/category-icon";
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
import {
  CATEGORY_COLORS,
  CATEGORY_ICON_NAMES,
  type CategoryColor,
  type CategoryIcon,
  categoryColorVar,
} from "@/lib/categories";
import type { FormState } from "@/lib/form-state";
import { saveCategory } from "@/server/actions/categories";
import type { CategoryOption } from "@/server/queries/categories";

type CategoryDialogProps = {
  category?: CategoryOption;
  defaultType?: "INCOME" | "EXPENSE";
  triggerProps?: ComponentProps<typeof Button>;
  children: ReactNode;
};

export function CategoryDialog({
  category,
  defaultType = "EXPENSE",
  triggerProps,
  children,
}: CategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button {...triggerProps} />}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Pick a name, color and icon so it&apos;s easy to spot in lists.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <CategoryForm
            category={category}
            defaultType={defaultType}
            onSaved={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  defaultType,
  onSaved,
}: {
  category?: CategoryOption;
  defaultType: "INCOME" | "EXPENSE";
  onSaved: () => void;
}) {
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await saveCategory(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      onSaved();
    }
    return result;
  }, undefined);

  const values = state?.values;
  const errors = state?.fieldErrors;
  const color = (values?.color ?? category?.color ?? "blue") as CategoryColor;
  const icon = (values?.icon ?? category?.icon ?? "tag") as CategoryIcon;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormMessage message={state?.ok ? undefined : state?.message} />
      {category && <input type="hidden" name="id" value={category.id} />}

      <FormField
        label="Name"
        name="name"
        autoFocus
        maxLength={30}
        defaultValue={values?.name ?? category?.name ?? ""}
        errors={errors?.name}
      />

      <FormField
        label="Type"
        name="type"
        errors={errors?.type}
        hint={category && "Type can't change once a category exists."}
      >
        {category ? (
          <>
            {/* Disabled selects aren't submitted, so send the value separately */}
            <input type="hidden" name="type" value={category.type} />
            <NativeSelect id="type" className="w-full" value={category.type} disabled>
              <NativeSelectOption value="EXPENSE">Expense</NativeSelectOption>
              <NativeSelectOption value="INCOME">Income</NativeSelectOption>
            </NativeSelect>
          </>
        ) : (
          <NativeSelect
            id="type"
            name="type"
            className="w-full"
            defaultValue={values?.type ?? defaultType}
          >
            <NativeSelectOption value="EXPENSE">Expense</NativeSelectOption>
            <NativeSelectOption value="INCOME">Income</NativeSelectOption>
          </NativeSelect>
        )}
      </FormField>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Color</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((option) => (
            <label key={option} className="relative cursor-pointer">
              <input
                type="radio"
                name="color"
                value={option}
                defaultChecked={option === color}
                className="peer sr-only"
                aria-label={option[0].toUpperCase() + option.slice(1)}
              />
              <span
                className="ring-offset-background peer-checked:ring-foreground peer-focus-visible:ring-ring block size-7 rounded-full ring-2 ring-transparent ring-offset-2"
                style={{ backgroundColor: categoryColorVar(option) }}
              />
            </label>
          ))}
        </div>
        {errors?.color && <p className="text-destructive text-sm">{errors.color[0]}</p>}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Icon</legend>
        <div className="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-lg border p-1">
          {CATEGORY_ICON_NAMES.map((option) => {
            const Icon = CATEGORY_ICONS[option];
            return (
              <label key={option} className="cursor-pointer">
                <input
                  type="radio"
                  name="icon"
                  value={option}
                  defaultChecked={option === icon}
                  className="peer sr-only"
                  aria-label={option.replace(/-/g, " ")}
                />
                <span className="hover:bg-muted peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-ring flex aspect-square items-center justify-center rounded-md peer-focus-visible:ring-2">
                  <Icon className="size-4" aria-hidden />
                </span>
              </label>
            );
          })}
        </div>
        {errors?.icon && <p className="text-destructive text-sm">{errors.icon[0]}</p>}
      </fieldset>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <SubmitButton>{category ? "Save changes" : "Add category"}</SubmitButton>
      </DialogFooter>
    </form>
  );
}
