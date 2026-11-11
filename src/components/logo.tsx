import { ChartNoAxesColumnIncreasing } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href,
  className,
  compactOnMobile = false,
}: {
  href: string;
  className?: string;
  /** Show only the icon below the sm breakpoint, where the header is crowded */
  compactOnMobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-linear-to-br from-emerald-400 to-teal-600 text-white shadow-md ring-1 shadow-emerald-600/25 ring-white/25 ring-inset">
        <ChartNoAxesColumnIncreasing className="size-4.5" strokeWidth={2.75} aria-hidden />
      </span>
      {/* Brand name: the same in every language */}
      <span className={cn(compactOnMobile && "sr-only sm:not-sr-only")}>Finance Tracker</span>
    </Link>
  );
}
