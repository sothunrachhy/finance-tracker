import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Prev / next links that keep every other search param. */
export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (pageCount <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string" && key !== "page") params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const linkClass = buttonVariants({ variant: "outline", size: "sm" });
  const disabledClass = cn(linkClass, "pointer-events-none opacity-50");

  return (
    <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
      <p className="text-muted-foreground text-sm">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        <Link
          href={href(page - 1)}
          className={page <= 1 ? disabledClass : linkClass}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
        >
          <ChevronLeft aria-hidden />
          Previous
        </Link>
        <Link
          href={href(page + 1)}
          className={page >= pageCount ? disabledClass : linkClass}
          aria-disabled={page >= pageCount}
          tabIndex={page >= pageCount ? -1 : undefined}
        >
          Next
          <ChevronRight aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
