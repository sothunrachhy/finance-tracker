import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/utils";

/** Prev / next links that keep every other search param. */
export async function Pagination({
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
  const { t } = await getI18n();

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
    <nav className="flex items-center justify-between gap-2" aria-label={t("pagination.label")}>
      <p className="text-muted-foreground text-sm">
        {t("pagination.page", { page, count: pageCount })}
      </p>
      <div className="flex gap-2">
        <Link
          href={href(page - 1)}
          className={page <= 1 ? disabledClass : linkClass}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
        >
          <ChevronLeft aria-hidden />
          {t("pagination.previous")}
        </Link>
        <Link
          href={href(page + 1)}
          className={page >= pageCount ? disabledClass : linkClass}
          aria-disabled={page >= pageCount}
          tabIndex={page >= pageCount ? -1 : undefined}
        >
          {t("pagination.next")}
          <ChevronRight aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
