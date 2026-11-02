import { Wallet } from "lucide-react";
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
      <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
        <Wallet className="size-4" aria-hidden />
      </span>
      {/* Brand name: the same in every language */}
      <span className={cn(compactOnMobile && "sr-only sm:not-sr-only")}>Finance Tracker</span>
    </Link>
  );
}
