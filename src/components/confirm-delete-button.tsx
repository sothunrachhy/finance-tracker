"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRowRemoval } from "@/components/removable-row";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import type { ActionResult } from "@/server/actions/transactions";

type ConfirmDeleteButtonProps = {
  /** Accessible name for the trash icon button, e.g. "Delete Groceries" */
  label: string;
  title: string;
  description: string;
  onConfirm: () => Promise<ActionResult>;
  disabled?: boolean;
  /** Explain why it can't be deleted yet: the dialog then only offers Close */
  blocked?: boolean;
};

export function ConfirmDeleteButton({
  label,
  title,
  description,
  onConfirm,
  disabled,
  blocked = false,
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { t } = useI18n();

  const hideRow = useRowRemoval();

  function handleConfirm() {
    // In a table row: take the row away now and put it back only if the delete fails,
    // instead of leaving it on screen until the server has sent the new list
    if (hideRow) {
      setOpen(false);
      hideRow(true);
    }
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
      } else {
        hideRow?.(false);
        toast.error(result.message);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        disabled={disabled}
        render={<Button variant="ghost" size="icon-sm" aria-label={label} title={label} />}
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {blocked ? (
            <AlertDialogCancel>{t("common.close")}</AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
              <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
                {pending && <Loader2 className="animate-spin" aria-hidden />}
                {t("common.delete")}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
