import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import type { Dictionary } from "@/i18n/dictionaries/en";

// Plain data only (no React), so validation, the database seed and tests can use it.
// The matching icon components live in src/components/category-icon.tsx.

// The 8 categorical chart colors, in their validated order. Each maps to a
// --series-N CSS variable with separate light and dark values (see globals.css).
export const CATEGORY_COLORS = [
  "blue",
  "orange",
  "aqua",
  "yellow",
  "magenta",
  "green",
  "violet",
  "red",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export function categoryColorVar(color: string): string {
  const index = CATEGORY_COLORS.indexOf(color as CategoryColor);
  return `var(--series-${index === -1 ? 1 : index + 1})`;
}

export const CATEGORY_ICON_NAMES = [
  "house",
  "shopping-cart",
  "utensils",
  "coffee",
  "car",
  "bus",
  "fuel",
  "plane",
  "zap",
  "wifi",
  "smartphone",
  "repeat",
  "heart-pulse",
  "stethoscope",
  "dumbbell",
  "shopping-bag",
  "shirt",
  "sofa",
  "film",
  "music",
  "book-open",
  "graduation-cap",
  "baby",
  "paw-print",
  "gift",
  "receipt",
  "landmark",
  "briefcase",
  "laptop",
  "trending-up",
  "piggy-bank",
  "wallet",
  "circle-dollar-sign",
  "tag",
] as const;

export type CategoryIcon = (typeof CATEGORY_ICON_NAMES)[number];

export type DefaultCategoryKey = keyof Dictionary["categoryNames"];

type DefaultCategory = {
  key: DefaultCategoryKey;
  type: "INCOME" | "EXPENSE";
  color: CategoryColor;
  icon: CategoryIcon;
};

/**
 * Created for every new account so the app is usable right away. Their names live
 * in the dictionaries (categoryNames), so they show in the current language until
 * the user renames them.
 */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { key: "salary", type: "INCOME", color: "green", icon: "briefcase" },
  { key: "freelance", type: "INCOME", color: "blue", icon: "laptop" },
  { key: "investments", type: "INCOME", color: "violet", icon: "trending-up" },
  { key: "otherIncome", type: "INCOME", color: "aqua", icon: "circle-dollar-sign" },
  { key: "housing", type: "EXPENSE", color: "blue", icon: "house" },
  { key: "groceries", type: "EXPENSE", color: "aqua", icon: "shopping-cart" },
  { key: "diningOut", type: "EXPENSE", color: "orange", icon: "utensils" },
  { key: "transport", type: "EXPENSE", color: "violet", icon: "car" },
  { key: "utilities", type: "EXPENSE", color: "yellow", icon: "zap" },
  { key: "subscriptions", type: "EXPENSE", color: "magenta", icon: "repeat" },
  { key: "health", type: "EXPENSE", color: "red", icon: "heart-pulse" },
  { key: "shopping", type: "EXPENSE", color: "green", icon: "shopping-bag" },
  { key: "entertainment", type: "EXPENSE", color: "orange", icon: "film" },
  { key: "other", type: "EXPENSE", color: "yellow", icon: "tag" },
];

/** A starter category's name in the given language. */
export function defaultCategoryName(key: string, locale: Locale): string {
  return dictionaries[locale].categoryNames[key as DefaultCategoryKey] ?? key;
}

/** Rows to insert for a new account. `name` is stored too, as the sign-up language's name. */
export function defaultCategoriesFor(locale: Locale) {
  return DEFAULT_CATEGORIES.map(({ key, ...category }) => ({
    ...category,
    defaultKey: key,
    name: defaultCategoryName(key, locale),
  }));
}
