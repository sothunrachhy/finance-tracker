ALTER TABLE "categories" ADD COLUMN "default_key" text;--> statement-breakpoint
-- Backfill: starter categories that still have their original English or Khmer name
UPDATE "categories" SET "default_key" = CASE "name"
  WHEN 'Salary' THEN 'salary' WHEN 'ប្រាក់ខែ' THEN 'salary'
  WHEN 'Freelance' THEN 'freelance' WHEN 'ការងារឯករាជ្យ' THEN 'freelance'
  WHEN 'Investments' THEN 'investments' WHEN 'ការវិនិយោគ' THEN 'investments'
  WHEN 'Other Income' THEN 'otherIncome' WHEN 'ចំណូលផ្សេងៗ' THEN 'otherIncome'
  WHEN 'Housing' THEN 'housing' WHEN 'លំនៅដ្ឋាន' THEN 'housing'
  WHEN 'Groceries' THEN 'groceries' WHEN 'គ្រឿងទេស' THEN 'groceries'
  WHEN 'Dining Out' THEN 'diningOut' WHEN 'ញ៉ាំអាហារខាងក្រៅ' THEN 'diningOut'
  WHEN 'Transport' THEN 'transport' WHEN 'ការធ្វើដំណើរ' THEN 'transport'
  WHEN 'Utilities' THEN 'utilities' WHEN 'ទឹកភ្លើង' THEN 'utilities'
  WHEN 'Subscriptions' THEN 'subscriptions' WHEN 'ការជាវប្រចាំ' THEN 'subscriptions'
  WHEN 'Health' THEN 'health' WHEN 'សុខភាព' THEN 'health'
  WHEN 'Shopping' THEN 'shopping' WHEN 'ការទិញទំនិញ' THEN 'shopping'
  WHEN 'Entertainment' THEN 'entertainment' WHEN 'ការកម្សាន្ត' THEN 'entertainment'
  WHEN 'Other' THEN 'other' WHEN 'ផ្សេងៗ' THEN 'other'
END;
