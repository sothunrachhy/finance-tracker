import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  name: string;
  errors?: string[];
  hint?: ReactNode;
  className?: string;
  /** Custom control (select, textarea...). Defaults to an <Input>. */
  children?: ReactNode;
} & Omit<ComponentProps<"input">, "name">;

/** Label + control + error message, wired together for screen readers. */
export function FormField({
  label,
  name,
  errors,
  hint,
  className,
  children,
  ...inputProps
}: FormFieldProps) {
  const id = inputProps.id ?? name;
  const errorId = `${id}-error`;
  const hasError = Boolean(errors?.length);

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children ?? (
        <Input
          id={id}
          name={name}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          {...inputProps}
        />
      )}
      {hint && !hasError && <p className="text-muted-foreground text-xs">{hint}</p>}
      {hasError && (
        <p id={errorId} className="text-destructive text-sm">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

/** Form-level error banner, e.g. "Invalid email or password". */
export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
    >
      {message}
    </p>
  );
}
