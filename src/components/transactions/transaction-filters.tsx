"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { TransactionFilters as Filters } from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { CategoryOption } from "@/server/queries/categories";

export function TransactionFilters({
  filters,
  categories,
}: {
  filters: Filters;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q);

  // The URL only updates once a navigation finishes, so quick successive changes
  // (clear filters, then type) build on this ref instead of a stale URL.
  const latestParams = useRef(searchParams.toString());
  useEffect(() => {
    latestParams.current = searchParams.toString();
  }, [searchParams]);

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(latestParams.current);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // any filter change starts again from page 1
    latestParams.current = params.toString();
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  }

  // Debounce typing so we don't hit the server on every keystroke
  useEffect(() => {
    if (query.trim() === filters.q) return;
    const timeout = setTimeout(() => update({ q: query.trim() || null }), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the text changes
  }, [query]);

  const visibleCategories =
    filters.type === "ALL" ? categories : categories.filter((c) => c.type === filters.type);
  const hasFilters = filters.type !== "ALL" || filters.categoryId || filters.q;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 transition-opacity",
        pending && "opacity-60",
      )}
      aria-busy={pending}
    >
      <div className="relative w-full sm:w-64">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search notes or categories"
          aria-label="Search transactions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-8"
        />
      </div>

      <NativeSelect
        aria-label="Filter by type"
        value={filters.type}
        onChange={(event) =>
          update({
            type: event.target.value === "ALL" ? null : event.target.value.toLowerCase(),
            category: null,
          })
        }
      >
        <NativeSelectOption value="ALL">All types</NativeSelectOption>
        <NativeSelectOption value="EXPENSE">Expenses</NativeSelectOption>
        <NativeSelectOption value="INCOME">Income</NativeSelectOption>
      </NativeSelect>

      <NativeSelect
        aria-label="Filter by category"
        value={filters.categoryId ?? ""}
        onChange={(event) => update({ category: event.target.value || null })}
      >
        <NativeSelectOption value="">All categories</NativeSelectOption>
        {visibleCategories.map((category) => (
          <NativeSelectOption key={category.id} value={category.id}>
            {category.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            setQuery("");
            update({ type: null, category: null, q: null });
          }}
        >
          <X aria-hidden />
          Clear filters
        </Button>
      )}
    </div>
  );
}
