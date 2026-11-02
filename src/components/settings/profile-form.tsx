"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { FormState } from "@/lib/form-state";
import { CURRENCIES } from "@/lib/money";
import { updateProfile } from "@/server/actions/settings";

export function ProfileForm({ name, currency }: { name: string; currency: string }) {
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await updateProfile(prev, formData);
    if (result?.ok) toast.success(result.message);
    return result;
  }, undefined);

  return (
    <form action={formAction} className="grid max-w-md gap-4" noValidate>
      <FormMessage message={state?.ok ? undefined : state?.message} />
      <FormField
        label="Name"
        name="name"
        autoComplete="name"
        defaultValue={state?.values?.name ?? name}
        errors={state?.fieldErrors?.name}
      />
      <FormField
        label="Currency"
        name="currency"
        errors={state?.fieldErrors?.currency}
        hint="Changes how amounts are displayed. Existing amounts aren't converted."
      >
        <NativeSelect
          id="currency"
          name="currency"
          className="w-full"
          defaultValue={state?.values?.currency ?? currency}
        >
          {CURRENCIES.map((c) => (
            <NativeSelectOption key={c.code} value={c.code}>
              {c.code} · {c.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormField>
      <div>
        <SubmitButton>Save profile</SubmitButton>
      </div>
    </form>
  );
}
