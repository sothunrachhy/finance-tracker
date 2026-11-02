import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryList } from "@/components/categories/category-list";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";
import { getCategoriesWithUsage } from "@/server/queries/categories";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories"
        description="Group your transactions so you can see where money comes from and goes."
      />
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
  const categories = await getCategoriesWithUsage(user.id);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <CategoryList
        title="Expenses"
        type="EXPENSE"
        categories={categories.filter((c) => c.type === "EXPENSE")}
      />
      <CategoryList
        title="Income"
        type="INCOME"
        categories={categories.filter((c) => c.type === "INCOME")}
      />
    </div>
  );
}
