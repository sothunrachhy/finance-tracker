import "server-only";
import { type SQL, sql } from "drizzle-orm";
import { categories } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

/**
 * A category's display name in SQL: starter categories (default_key set) use the
 * dictionary name for `locale`, renamed or custom ones use their stored name.
 * Doing it in SQL means sorting and search work on what the user actually sees.
 */
export function categoryName(locale: Locale): SQL<string> {
  const cases = Object.entries(dictionaries[locale].categoryNames).map(
    ([key, name]) => sql`when ${key} then ${name}`,
  );
  return sql<string>`coalesce(case ${categories.defaultKey} ${sql.join(cases, sql` `)} end, ${categories.name})`;
}

/**
 * Sorts names A–Z ignoring case, so a user's "groceries" sits next to "Groceries"
 * instead of after every capitalized name (Postgres compares bytes by default).
 */
export function alphabetical(name: SQL<string>): SQL[] {
  return [sql`lower(${name})`, name];
}
