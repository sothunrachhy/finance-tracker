"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useI18n } from "@/i18n/client";
import type { FormState } from "@/lib/form-state";
import { CURRENCY_CODES, currencyName } from "@/lib/money";
import { updateProfile } from "@/server/actions/settings";

export function ProfileForm({ name, currency }: { name: string; currency: string }) {
  const { locale, t } = useI18n();
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await updateProfile(prev, formData);
    if (result?.ok) toast.success(result.message);
    return result;
  }, undefined);

  return (
    <form action={formAction} className="grid max-w-md gap-4" noValidate>
      <FormMessage message={state?.ok ? undefined : state?.message} />
      <FormField
        label={t("settings.name")}
        name="name"
        autoComplete="name"
        defaultValue={state?.values?.name ?? name}
        errors={state?.fieldErrors?.name}
      />
      <FormField
        label={t("settings.currency")}
        name="currency"
        errors={state?.fieldErrors?.currency}
        hint={t("settings.currencyHint")}
      >
        <NativeSelect
          // Remount after submit so the select shows the submitted currency
          key={state?.values?.currency}
          id="currency"
          name="currency"
          className="w-full"
          defaultValue={state?.values?.currency ?? currency}
        >
          {CURRENCY_CODES.map((code) => (
            <NativeSelectOption key={code} value={code}>
              {code} · {currencyName(code, locale)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormField>
      <div>
        <SubmitButton>{t("settings.saveProfile")}</SubmitButton>
      </div>
    </form>
  );
}
