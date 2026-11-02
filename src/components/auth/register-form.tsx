"use client";

import { useActionState } from "react";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useI18n } from "@/i18n/client";
import { register } from "@/server/actions/auth";

export function RegisterForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(register, undefined);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormMessage message={state?.message} />
      <FormField
        label={t("auth.name")}
        name="name"
        autoComplete="name"
        required
        defaultValue={state?.values?.name}
        errors={state?.fieldErrors?.name}
      />
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
        autoComplete="new-password"
        required
        hint={t("auth.passwordHint")}
        errors={state?.fieldErrors?.password}
      />
      <SubmitButton size="lg" className="w-full">
        {t("auth.registerButton")}
      </SubmitButton>
    </form>
  );
}
