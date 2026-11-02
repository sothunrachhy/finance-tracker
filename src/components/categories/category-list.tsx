"use client";

import { Pencil, Plus } from "lucide-react";
import { CategoryIconBadge } from "@/components/category-icon";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n/client";
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
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <CategoryDialog defaultType={type} triggerProps={{ variant: "outline", size: "sm" }}>
            <Plus aria-hidden />
            {t("common.add")}
          </CategoryDialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">{t("categories.none")}</p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-3 py-2.5">
                <CategoryIconBadge icon={category.icon} color={category.color} />
                <div className="grid min-w-0 flex-1">
                  <span className="truncate font-medium">{category.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {t("categories.usage", { count: category.transactionCount })}
                  </span>
                </div>
                <CategoryDialog
                  category={category}
                  triggerProps={{
                    variant: "ghost",
                    size: "icon-sm",
                    "aria-label": t("categories.editLabel", { name: category.name }),
                    title: t("common.edit"),
                  }}
                >
                  <Pencil />
                </CategoryDialog>
                <ConfirmDeleteButton
                  label={t("categories.deleteLabel", { name: category.name })}
                  title={t("categories.deleteTitle", { name: category.name })}
                  description={
                    category.transactionCount > 0
                      ? t("categories.deleteBlocked", { count: category.transactionCount })
                      : t("categories.deleteWarning")
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
