import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryList } from "@/components/categories/category-list";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getCategoriesWithUsage } from "@/server/queries/categories";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("categories.title") };
}

export default async function CategoriesPage() {
  const { t } = await getI18n();

  return (
    <>
      <PageHeader title={t("categories.title")} description={t("categories.description")} />
      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
        }
      >
        <Categories />
      </Suspense>
    </>
  );
}

async function Categories() {
  const user = await getCurrentUser();
  const { locale, t } = await getI18n();
  const categories = await getCategoriesWithUsage(user.id, locale);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <CategoryList
        title={t("categories.expenses")}
        type="EXPENSE"
        categories={categories.filter((c) => c.type === "EXPENSE")}
      />
      <CategoryList
        title={t("categories.income")}
        type="INCOME"
        categories={categories.filter((c) => c.type === "INCOME")}
      />
    </div>
  );
}
