"use client";

import { Pencil, Plus } from "lucide-react";
import { CategoryIconBadge } from "@/components/category-icon";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCategory } from "@/server/actions/categories";
import type { CategoryWithUsage } from "@/server/queries/categories";
import { CategoryDialog } from "./category-dialog";

export function CategoryList({
  title,
  type,
  categories,
}: {
  title: string;
  type: "INCOME" | "EXPENSE";
  categories: CategoryWithUsage[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <CategoryDialog defaultType={type} triggerProps={{ variant: "outline", size: "sm" }}>
            <Plus aria-hidden />
            Add
          </CategoryDialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No categories yet.</p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-3 py-2.5">
                <CategoryIconBadge icon={category.icon} color={category.color} />
                <div className="grid min-w-0 flex-1">
                  <span className="truncate font-medium">{category.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {category.transactionCount}{" "}
                    {category.transactionCount === 1 ? "transaction" : "transactions"}
                  </span>
                </div>
                <CategoryDialog
                  category={category}
                  triggerProps={{
                    variant: "ghost",
                    size: "icon-sm",
                    "aria-label": `Edit ${category.name}`,
                    title: "Edit",
                  }}
                >
                  <Pencil />
                </CategoryDialog>
                <ConfirmDeleteButton
                  label={`Delete ${category.name}`}
                  title={`Delete “${category.name}”?`}
                  description={
                    category.transactionCount > 0
                      ? `It still has ${category.transactionCount} transactions, so it can't be deleted until you delete or re-categorize them.`
                      : "Any budgets for this category will be removed too. This can't be undone."
                  }
                  onConfirm={() => deleteCategory(category.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
