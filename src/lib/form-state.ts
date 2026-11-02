import { z } from "zod";

/** What every form Server Action returns to `useActionState`. */
export type FormState =
  | {
      ok?: boolean;
      /** Form-level message, e.g. "Invalid email or password" */
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Submitted values, so inputs keep what the user typed after an error */
      values?: Record<string, string>;
    }
  | undefined;

export function fieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}

/** Reads the given fields from FormData as strings (missing fields become ""). */
export function formValues<K extends string>(formData: FormData, keys: readonly K[]) {
  return Object.fromEntries(keys.map((key) => [key, String(formData.get(key) ?? "")])) as Record<
    K,
    string
  >;
}
