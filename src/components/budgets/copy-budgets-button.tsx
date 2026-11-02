"use client";

import { Copy, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyBudgetsFromPreviousMonth } from "@/server/actions/budgets";

export function CopyBudgetsButton({ month, label }: { month: string; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await copyBudgetsFromPreviousMonth(month);
          if (result.ok) toast.success(result.message);
          else toast.error(result.message);
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Copy aria-hidden />}
      {label}
    </Button>
  );
}
