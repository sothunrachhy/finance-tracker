import { Sparkles } from "lucide-react";
import type { ComponentProps, ElementType } from "react";
import { SubmitButton } from "@/components/submit-button";
import { loginAsDemo } from "@/server/actions/auth";

/** Logs in to a shared demo account (in the current language) filled with sample data. */
export function DemoButton({
  children,
  icon: Icon = Sparkles,
  ...props
}: ComponentProps<typeof SubmitButton> & { icon?: ElementType }) {
  return (
    <form action={loginAsDemo}>
      <SubmitButton variant="outline" {...props}>
        <Icon aria-hidden />
        {children}
      </SubmitButton>
    </form>
  );
}
