"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/form-state";
import { changePassword } from "@/server/actions/settings";

export function PasswordForm({ disabled }: { disabled?: boolean }) {
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
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          errors={errors?.currentPassword}
        />
        <FormField
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          errors={errors?.newPassword}
        />
        <FormField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          errors={errors?.confirmPassword}
        />
        <div>
          <SubmitButton>Change password</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
