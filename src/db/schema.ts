import { relations, sql } from "drizzle-orm";
import {
  char,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const categoryType = pgEnum("category_type", ["INCOME", "EXPENSE"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // ISO 4217 code, e.g. "USD"
  currency: char("currency", { length: 3 }).notNull().default("USD"),
  ...timestamps,
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: categoryType("type").notNull(),
    // Palette key such as "blue" (see CATEGORY_COLORS), so dark mode gets its own shade
    color: text("color").notNull(),
    // Icon key such as "utensils" (see CATEGORY_ICONS)
    icon: text("icon").notNull(),
    // Set for starter categories (e.g. "groceries") so their name follows the app's
    // language. Cleared when the user renames the category.
    defaultKey: text("default_key"),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    uniqueIndex("categories_user_name_type_key").on(t.userId, t.name, t.type),
    index("categories_user_id_idx").on(t.userId),
  ],
);

// Income vs expense comes from the category, so it is never stored twice.
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Restrict: a category with transactions cannot be deleted by accident
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    // Always positive, in the smallest currency unit (cents) to avoid float errors
    amount: integer("amount").notNull(),
    // "YYYY-MM-DD" string, so no timezone shifts between server and browser
    date: date("date", { mode: "string" }).notNull(),
    note: text("note"),
    ...timestamps,
  },
  (t) => [
    index("transactions_user_date_idx").on(t.userId, t.date),
    index("transactions_category_id_idx").on(t.categoryId),
    check("transactions_amount_positive", sql`${t.amount} > 0`),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    // First day of the month this budget applies to
    month: date("month", { mode: "string" }).notNull(),
    // Spending limit in cents
    amount: integer("amount").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("budgets_user_category_month_key").on(t.userId, t.categoryId, t.month),
    check("budgets_amount_positive", sql`${t.amount} > 0`),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
}));

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
