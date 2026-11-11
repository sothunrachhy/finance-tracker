"use client";

import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { logout } from "@/server/actions/auth";

/** "Sokha Chan" -> "SC". Skips symbols, so "<Sokha" gives "S", not "<". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.match(/[\p{L}\p{N}]/u)?.[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-600 text-xs font-semibold text-white shadow-sm ring-2 ring-white dark:ring-white/10",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/**
 * The account menu. "avatar" is a round button for the header; "card" shows the
 * name and email, for the bottom of the sidebar.
 */
export function UserMenu({
  name,
  email,
  variant = "avatar",
  className,
}: {
  name: string;
  email: string;
  variant?: "avatar" | "card";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const { t, path } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          variant === "card" ? (
            <button
              type="button"
              aria-label={t("nav.accountMenu")}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border border-white bg-white/80 p-2.5 text-left shadow-sm transition-colors hover:bg-white focus-visible:ring-3 focus-visible:ring-teal-500/30 focus-visible:outline-none dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                className,
              )}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("nav.accountMenu")}
              className={cn("size-9 rounded-full p-0", className)}
            />
          )
        }
      >
        <Avatar name={name} />
        {variant === "card" && (
          <>
            <span className="grid min-w-0 flex-1">
              <span className="truncate text-sm font-semibold">{name}</span>
              <span className="text-muted-foreground truncate text-xs">{email}</span>
            </span>
            <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="grid">
            <span className="text-foreground truncate">{name}</span>
            <span className="truncate font-normal">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={path("/settings")} />}>
          <Settings />
          {t("nav.settings")}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={pending} onClick={() => startTransition(() => logout())}>
          <LogOut />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
