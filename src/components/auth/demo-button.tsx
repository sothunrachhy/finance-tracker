import { Sparkles } from "lucide-react";
import type { ComponentProps } from "react";
import { SubmitButton } from "@/components/submit-button";
import { loginAsDemo } from "@/server/actions/auth";

/** Logs in to a shared demo account (in the current language) filled with sample data. */
export function DemoButton({ children, ...props }: ComponentProps<typeof SubmitButton>) {
  return (
    <form action={loginAsDemo}>
      <SubmitButton variant="outline" {...props}>
        <Sparkles aria-hidden />
        {children}
      </SubmitButton>
    </form>
  );
}
