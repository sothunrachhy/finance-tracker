import type { Locale } from "@/i18n/config";

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

type DefaultCategory = {
  name: string;
  type: "INCOME" | "EXPENSE";
  color: CategoryColor;
  icon: CategoryIcon;
};

/** Created for every new account so the app is usable right away. */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Salary", type: "INCOME", color: "green", icon: "briefcase" },
  { name: "Freelance", type: "INCOME", color: "blue", icon: "laptop" },
  { name: "Investments", type: "INCOME", color: "violet", icon: "trending-up" },
  { name: "Other Income", type: "INCOME", color: "aqua", icon: "circle-dollar-sign" },
  { name: "Housing", type: "EXPENSE", color: "blue", icon: "house" },
  { name: "Groceries", type: "EXPENSE", color: "aqua", icon: "shopping-cart" },
  { name: "Dining Out", type: "EXPENSE", color: "orange", icon: "utensils" },
  { name: "Transport", type: "EXPENSE", color: "violet", icon: "car" },
  { name: "Utilities", type: "EXPENSE", color: "yellow", icon: "zap" },
  { name: "Subscriptions", type: "EXPENSE", color: "magenta", icon: "repeat" },
  { name: "Health", type: "EXPENSE", color: "red", icon: "heart-pulse" },
  { name: "Shopping", type: "EXPENSE", color: "green", icon: "shopping-bag" },
  { name: "Entertainment", type: "EXPENSE", color: "orange", icon: "film" },
  { name: "Other", type: "EXPENSE", color: "yellow", icon: "tag" },
];

/** Khmer names for the default categories, keyed by the English name. */
const DEFAULT_CATEGORY_NAMES_KM: Record<string, string> = {
  Salary: "ប្រាក់ខែ",
  Freelance: "ការងារឯករាជ្យ",
  Investments: "ការវិនិយោគ",
  "Other Income": "ចំណូលផ្សេងៗ",
  Housing: "លំនៅដ្ឋាន",
  Groceries: "គ្រឿងទេស",
  "Dining Out": "ញ៉ាំអាហារខាងក្រៅ",
  Transport: "ការធ្វើដំណើរ",
  Utilities: "ទឹកភ្លើង",
  Subscriptions: "ការជាវប្រចាំ",
  Health: "សុខភាព",
  Shopping: "ការទិញទំនិញ",
  Entertainment: "ការកម្សាន្ត",
  Other: "ផ្សេងៗ",
};

/** Default categories named in the user's language (users can rename them later). */
export function defaultCategoriesFor(locale: Locale): DefaultCategory[] {
  if (locale === "en") return DEFAULT_CATEGORIES;
  return DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    name: DEFAULT_CATEGORY_NAMES_KM[c.name] ?? c.name,
  }));
}
