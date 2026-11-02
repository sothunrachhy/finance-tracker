"use client";

import { useActionState } from "react";
import { FormField, FormMessage } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { register } from "@/server/actions/auth";

export function RegisterForm() {
  const [state, formAction] = useActionState(register, undefined);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormMessage message={state?.message} />
      <FormField
        label="Name"
        name="name"
        autoComplete="name"
        required
        defaultValue={state?.values?.name}
        errors={state?.fieldErrors?.name}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state?.values?.email}
        errors={state?.fieldErrors?.email}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters"
        errors={state?.fieldErrors?.password}
      />
      <SubmitButton size="lg" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
