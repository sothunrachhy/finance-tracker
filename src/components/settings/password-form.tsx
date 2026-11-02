"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useI18n } from "@/i18n/client";
import type { FormState } from "@/lib/form-state";
import { changePassword } from "@/server/actions/settings";

export function PasswordForm({ disabled }: { disabled?: boolean }) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await changePassword(prev, formData);
    if (result?.ok) toast.success(result.message);
    return result;
  }, undefined);

  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="grid max-w-md gap-4" noValidate>
      <FormMessage message={state?.ok ? undefined : state?.message} />
      <fieldset disabled={disabled} className="grid gap-4 disabled:opacity-60">
        <FormField
          label={t("settings.currentPassword")}
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          errors={errors?.currentPassword}
        />
        <FormField
          label={t("settings.newPassword")}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          hint={t("settings.passwordHint")}
          errors={errors?.newPassword}
        />
        <FormField
          label={t("settings.confirmPassword")}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          errors={errors?.confirmPassword}
        />
        <div>
          <SubmitButton>{t("settings.changePassword")}</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
