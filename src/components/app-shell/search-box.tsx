"use client";

import { Search } from "lucide-react";
import Form from "next/form";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

const noSubscription = () => () => {};

const kbdClass =
  "text-muted-foreground pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border bg-slate-50 px-1.5 py-0.5 font-sans text-[11px] dark:bg-white/5";

/**
 * Searches transaction notes across every month, on the transactions page.
 * Ctrl+K (⌘K on a Mac) jumps here from anywhere in the app.
 */
export function SearchBox({ className }: { className?: string }) {
  const { t, path } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  // The server can't know the platform: it renders "Ctrl K", and a Mac switches to "⌘K"
  const isMac = useSyncExternalStore(
    noSubscription,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Form action={path("/transactions")} role="search" className={cn("relative", className)}>
      <input type="hidden" name="month" value="all" />
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
        aria-hidden
      />
      <input
        ref={input}
        type="search"
        name="q"
        maxLength={100}
        enterKeyHint="search"
        aria-label={t("nav.search")}
        placeholder={t("nav.searchPlaceholder")}
        className="peer h-10 w-full rounded-full border border-slate-200/80 bg-white/80 pr-3 pl-10 text-sm shadow-sm transition outline-none placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-3 focus-visible:ring-teal-500/20 sm:pr-16 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500"
      />
      {/* The shortcut until the box has focus, then a reminder that Enter searches */}
      <kbd className={cn(kbdClass, "sm:block sm:peer-focus:hidden")}>{isMac ? "⌘K" : "Ctrl K"}</kbd>
      <kbd className={cn(kbdClass, "sm:peer-focus:block")}>↵ Enter</kbd>
    </Form>
  );
}
