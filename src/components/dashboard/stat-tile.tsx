import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  footnote,
  icon: Icon,
}: {
  label: string;
  value: string;
  footnote?: ReactNode;
  icon: LucideIcon;
}) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-1">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          {label}
          <Icon className="size-4" aria-hidden />
        </div>
        <p className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
        {footnote && <p className="text-muted-foreground text-xs">{footnote}</p>}
      </CardContent>
    </Card>
  );
}
