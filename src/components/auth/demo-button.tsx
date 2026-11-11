import { Sparkles } from "lucide-react";
import type { ComponentProps, ElementType } from "react";
import { SubmitButton } from "@/components/submit-button";
import { getI18n } from "@/i18n/server";
import { loginAsDemo } from "@/server/actions/auth";

/** Logs in to a shared demo account (in the current language) filled with sample data. */
export async function DemoButton({
  children,
  icon: Icon = Sparkles,
  ...props
}: ComponentProps<typeof SubmitButton> & { icon?: ElementType }) {
  const { t } = await getI18n();
  return (
    <form action={loginAsDemo}>
      {/* Seeding takes several seconds, so say what's happening */}
      <SubmitButton variant="outline" pendingLabel={t("landing.demoLoading")} {...props}>
        <Icon aria-hidden />
        {children}
      </SubmitButton>
    </form>
  );
}
