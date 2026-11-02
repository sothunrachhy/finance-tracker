import type { Locale } from "@/i18n/config";
import { currentMonth, daysInMonth, shiftMonth, todayISO } from "@/lib/dates";

// Generates realistic-looking data for the demo account: the current month up to
// today plus the DEMO_MONTHS_BACK months before it. A seeded random generator makes the output
// identical on every run, which keeps the demo (and its tests) predictable.

export type DemoTransaction = {
  category: string;
  amount: number; // cents
  date: string;
  note: string | null;
};

export const DEMO_BUDGETS: { category: string; amount: number }[] = [
  { category: "Groceries", amount: 40_000 },
  { category: "Dining Out", amount: 15_000 },
  { category: "Transport", amount: 10_000 },
  { category: "Shopping", amount: 15_000 },
  { category: "Entertainment", amount: 8_000 },
  { category: "Subscriptions", amount: 3_000 },
];

// 5 past months + the current one fills the dashboard's 6-month chart
export const DEMO_MONTHS_BACK = 5;

/** Khmer versions of the demo notes, keyed by the English note. */
const DEMO_NOTES_KM: Record<string, string> = {
  "Monthly salary": "ប្រាក់ខែប្រចាំខែ",
  Rent: "ថ្លៃឈ្នួលផ្ទះ",
  "Gym membership": "សមាជិកភាពក្លឹបហាត់ប្រាណ",
  Internet: "អ៊ីនធឺណិត",
  Electricity: "អគ្គិសនី",
  Supermarket: "ផ្សារទំនើប",
  "Lunch with team": "អាហារថ្ងៃត្រង់ជាមួយក្រុម",
  "Pizza night": "ភីហ្សាពេលល្ងាច",
  "Coffee & pastry": "កាហ្វេ និងនំ",
  "Sushi dinner": "អាហារពេលល្ងាចស៊ូស៊ី",
  Brunch: "អាហារព្រឹកយឺត",
  "Bus pass top-up": "បញ្ចូលលុយកាតឡានក្រុង",
  Taxi: "តាក់ស៊ី",
  Parking: "ថ្លៃចំណតរថយន្ត",
  Fuel: "សាំង",
  Clothes: "សម្លៀកបំពាក់",
  "Household items": "សម្ភារៈប្រើប្រាស់ក្នុងផ្ទះ",
  "Phone case": "ស្រោមទូរស័ព្ទ",
  Books: "សៀវភៅ",
  Cinema: "មើលភាពយន្ត",
  "Concert tickets": "សំបុត្រប្រគុំតន្ត្រី",
  "Board game": "ល្បែងក្ដារ",
  Bowling: "បូលីង",
  Pharmacy: "ឱសថស្ថាន",
  "Gift for a friend": "កាដូជូនមិត្តភក្តិ",
  "Website project": "គម្រោងគេហទំព័រ",
  Dividends: "ភាគលាភ",
};

export function localizeDemoNote(note: string | null, locale: Locale): string | null {
  if (note === null || locale === "en") return note;
  return DEMO_NOTES_KM[note] ?? note;
}

// mulberry32: tiny, fast, deterministic PRNG returning values in [0, 1)
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDemoTransactions(now: Date = new Date()): DemoTransaction[] {
  const random = createRandom(42);
  const between = (min: number, max: number) => Math.round(min + random() * (max - min));
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];

  const today = todayISO(now);
  const thisMonth = currentMonth(now);
  const result: DemoTransaction[] = [];

  for (let offset = -DEMO_MONTHS_BACK; offset <= 0; offset++) {
    const month = shiftMonth(thisMonth, offset);
    const lastDay = daysInMonth(month);

    const add = (day: number, category: string, amount: number, note: string | null = null) => {
      const date = `${month}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
      if (date <= today) result.push({ category, amount, date, note });
    };
    const repeat = (min: number, max: number, fn: () => void) => {
      for (let i = between(min, max); i > 0; i--) fn();
    };

    // Fixed monthly items
    add(1, "Salary", 420_000, "Monthly salary");
    add(1, "Housing", 120_000, "Rent");
    add(2, "Health", 3_500, "Gym membership");
    add(5, "Subscriptions", 1_549, "Netflix");
    add(8, "Subscriptions", 1_199, "Spotify");
    add(12, "Utilities", 4_999, "Internet");
    add(between(18, 22), "Utilities", between(6_000, 9_500), "Electricity");

    // Weekly groceries
    for (const day of [3, 10, 17, 24]) {
      add(day + between(0, 2), "Groceries", between(5_500, 12_500), "Supermarket");
    }

    // Variable spending
    repeat(4, 7, () =>
      add(
        between(1, lastDay),
        "Dining Out",
        between(1_200, 4_800),
        pick(["Lunch with team", "Pizza night", "Coffee & pastry", "Sushi dinner", "Brunch"]),
      ),
    );
    repeat(5, 8, () =>
      add(
        between(1, lastDay),
        "Transport",
        between(250, 1_800),
        pick(["Bus pass top-up", "Taxi", "Parking"]),
      ),
    );
    add(between(10, 20), "Transport", between(3_500, 5_500), "Fuel");
    repeat(1, 3, () =>
      add(
        between(1, lastDay),
        "Shopping",
        between(2_000, 12_000),
        pick(["Clothes", "Household items", "Phone case", "Books"]),
      ),
    );
    repeat(1, 3, () =>
      add(
        between(1, lastDay),
        "Entertainment",
        between(1_000, 6_000),
        pick(["Cinema", "Concert tickets", "Board game", "Bowling"]),
      ),
    );
    if (random() < 0.5) add(between(1, lastDay), "Health", between(800, 3_500), "Pharmacy");
    if (random() < 0.4)
      add(between(1, lastDay), "Other", between(2_000, 5_000), "Gift for a friend");

    // Occasional income
    if (random() < 0.7) {
      add(between(14, 25), "Freelance", between(30_000, 90_000), "Website project");
    }
    if (random() < 0.5) add(28, "Investments", between(2_000, 6_000), "Dividends");
  }

  return result.sort((a, b) => b.date.localeCompare(a.date));
}
