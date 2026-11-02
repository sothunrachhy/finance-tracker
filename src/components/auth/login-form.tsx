"use client";

import { useActionState } from "react";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useI18n } from "@/i18n/client";
import { login } from "@/server/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(login, undefined);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormMessage message={state?.message} />
      <input type="hidden" name="next" value={next ?? ""} />
      <FormField
        label={t("auth.email")}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state?.values?.email}
        errors={state?.fieldErrors?.email}
      />
      <FormField
        label={t("auth.password")}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={state?.fieldErrors?.password}
      />
      <SubmitButton size="lg" className="w-full">
        {t("auth.loginButton")}
      </SubmitButton>
    </form>
  );
}
