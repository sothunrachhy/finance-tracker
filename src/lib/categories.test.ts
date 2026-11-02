import { describe, expect, it } from "vitest";
import { DEFAULT_CATEGORIES, defaultCategoriesFor, defaultCategoryName } from "./categories";

describe("starter categories", () => {
  it("are named in the requested language and keep their key", () => {
    const english = defaultCategoriesFor("en");
    const khmer = defaultCategoriesFor("km");

    expect(english[0]).toMatchObject({ defaultKey: "salary", name: "Salary", type: "INCOME" });
    expect(khmer[0]).toMatchObject({ defaultKey: "salary", name: "ប្រាក់ខែ", type: "INCOME" });
    expect(khmer).toHaveLength(DEFAULT_CATEGORIES.length);
  });

  it("have a name in every language", () => {
    for (const { key } of DEFAULT_CATEGORIES) {
      expect(defaultCategoryName(key, "en")).not.toBe(key);
      expect(defaultCategoryName(key, "km")).not.toBe(key);
    }
  });
});
