import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import type { IconComponent } from "@/components/icons/mingcute";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** How a value moved since last month, e.g. text "+12% vs Oct" with label "+12%" */
export type Change = {
  /** The whole sentence */
  text: string;
  /** The part of `text` that gets the arrow and color */
  label: string;
  direction: "up" | "down" | "flat";
  /** Whether this direction is good news (more income, less spending) */
  good: boolean;
};

export function StatTile({
  label,
  value,
  icon: Icon,
  accent,
  tone = "neutral",
  change,
  footnote,
  aside,
  chart,
}: {
  label: string;
  value: string;
  icon: IconComponent;
  /** Background and text colors of the icon tile */
  accent: string;
  /** Good/bad state of the value: green when positive, red when negative */
  tone?: "neutral" | "positive" | "negative";
  change?: Change;
  /** Shown when there's no change to report */
  footnote?: ReactNode;
  /** Next to the label, e.g. a progress ring */
  aside?: ReactNode;
  /** Bottom right, e.g. a sparkline */
  chart?: ReactNode;
}) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-2.5 sm:px-4">
        {/* Label right before value: the text reads "Income $1,000.00" */}
        <div className="flex items-center gap-3">
          <span
            className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl", accent)}
          >
            <Icon className="size-5" />
          </span>
          <p className="text-muted-foreground min-w-0 flex-1 truncate text-sm font-medium">
            {label}
          </p>
          {aside}
        </div>
        <p
          className={cn(
            "truncate text-xl font-bold tracking-tight sm:text-2xl",
            tone === "positive" && "text-success",
            tone === "negative" && "text-destructive",
          )}
        >
          {value}
        </p>
        <div className="flex min-h-9 items-end justify-between gap-2">
          {change ? (
            <ChangeLine change={change} />
          ) : (
            footnote && <p className="text-muted-foreground text-xs">{footnote}</p>
          )}
          {chart && <div className="hidden shrink-0 sm:block">{chart}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

/** Arrow, sign and words, so the direction never relies on color alone */
function ChangeLine({ change }: { change: Change }) {
  const [before, after] = change.text.split(change.label);
  const Arrow =
    change.direction === "up" ? ArrowUp : change.direction === "down" ? ArrowDown : null;
  return (
    <p className="text-muted-foreground text-xs">
      {before}
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-semibold",
          change.direction === "flat"
            ? "text-foreground"
            : change.good
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400",
        )}
      >
        {Arrow && <Arrow className="size-3.5" aria-hidden />}
        {change.label}
      </span>
      {after}
    </p>
  );
}
