import "server-only";
import path from "node:path";
import {
  Defs,
  Document,
  Font,
  LinearGradient,
  Page,
  Rect,
  renderToBuffer,
  Stop,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/translator";
import { CATEGORY_COLORS } from "@/lib/categories";
import { formatDate, formatMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { type BudgetStatus, budgetStatus, formatPercent, savingsRate } from "@/lib/stats";

// Fonts ship with the app (see outputFileTracingIncludes in next.config.ts). Latin text
// uses Geist like the site; Khmer characters fall through to Kantumruy Pro.
const FONTS = path.join(process.cwd(), "src/assets/fonts");
Font.register({
  family: "Geist",
  fonts: [
    { src: path.join(FONTS, "Geist-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS, "Geist-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(FONTS, "Geist-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.register({
  family: "Kantumruy Pro",
  fonts: [
    { src: path.join(FONTS, "KantumruyPro-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS, "KantumruyPro-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(FONTS, "KantumruyPro-Bold.ttf"), fontWeight: 700 },
  ],
});
// Long notes wrap at spaces only; the default would hyphenate mid-word
Font.registerHyphenationCallback((word) => [word]);

// The site's palette (globals.css), as plain hex for the PDF
const INK = "#172b35";
const MUTED = "#5b6b73";
const LINE = "#e3eeea";
const MINT = "#e6faf3";
const TEAL = "#0f766e";
const GOOD = "#047857";
const BAD = "#be123c";
const SERIES = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#6250d6",
  "#e34948",
];
const STATUS_COLOR: Record<BudgetStatus, string> = {
  ok: "#0ca30c",
  warning: "#b77900",
  over: "#d03b3b",
};

function categoryHex(color: string): string {
  const index = CATEGORY_COLORS.indexOf(color as (typeof CATEGORY_COLORS)[number]);
  return SERIES[index === -1 ? 0 : index];
}

export type StatementData = {
  user: { name: string; email: string; currency: string };
  month: string;
  generatedOn: string;
  summary: { income: number; expenses: number };
  spending: { id: string; name: string; color: string; total: number }[];
  budgets: {
    id: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    spent: number;
  }[];
  transactions: {
    id: string;
    date: string;
    type: "INCOME" | "EXPENSE";
    category: string;
    color: string;
    amount: number;
    note: string | null;
  }[];
};

/** A designed monthly statement: header, totals, spending, budgets and every transaction. */
export function renderStatement(data: StatementData, locale: Locale, t: Translator) {
  return renderToBuffer(<Statement data={data} locale={locale} t={t} />);
}

function Statement({ data, locale, t }: { data: StatementData; locale: Locale; t: Translator }) {
  const { user, summary } = data;
  const money = (cents: number, sign: "auto" | "always" | "exceptZero" = "auto") =>
    formatMoney(cents, user.currency, { locale, signDisplay: sign });
  const monthName = formatMonth(data.month, "long", locale);
  const net = summary.income - summary.expenses;
  const rate = savingsRate(summary.income, summary.expenses);
  const maxSpending = Math.max(1, ...data.spending.map((row) => row.total));
  const title = t("report.title");

  return (
    <Document title={`${title}: ${monthName}`} author="Finance Tracker" language={locale}>
      <Page size="A4" style={styles.page}>
        {/* Footer on every page (fixed elements go first) */}
        <View style={styles.footer} fixed>
          <Text>
            Finance Tracker · {title} · {monthName}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              t("report.page", { page: pageNumber, total: totalPages })
            }
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <LogoMark />
            <Text style={styles.brandName}>Finance Tracker</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.month}>{monthName}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <Text>
            {t("report.preparedFor", { name: user.name })} · {user.email}
          </Text>
          <Text>{t("report.generated", { date: formatDate(data.generatedOn, locale) })}</Text>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <Total label={t("dashboard.income")} value={money(summary.income)} />
          <Total label={t("dashboard.expenses")} value={money(summary.expenses)} />
          <Total
            label={t("dashboard.net")}
            value={money(net, "exceptZero")}
            color={net > 0 ? GOOD : net < 0 ? BAD : INK}
          />
          <Total
            label={t("dashboard.savingsRate")}
            value={rate === null ? "—" : formatPercent(rate)}
            color={rate === null || rate === 0 ? INK : rate > 0 ? GOOD : BAD}
          />
        </View>

        {/* Spending and budgets, side by side */}
        <View style={styles.columns}>
          <View style={[styles.card, { flex: 3 }]}>
            <Text style={styles.cardTitle}>{t("dashboard.spendingByCategory")}</Text>
            {data.spending.length === 0 ? (
              <Text style={styles.empty}>{t("dashboard.noExpenses")}</Text>
            ) : (
              data.spending.slice(0, 8).map((row) => (
                <View key={row.id} style={styles.barRow} wrap={false}>
                  <View style={styles.barLabels}>
                    <View style={[styles.dot, { backgroundColor: categoryHex(row.color) }]} />
                    <Text style={styles.barName}>{row.name}</Text>
                    <Text style={styles.barAmount}>{money(row.total)}</Text>
                    <Text style={styles.barShare}>
                      {formatPercent(row.total / Math.max(summary.expenses, 1))}
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={{
                        width: `${Math.max((row.total / maxSpending) * 100, 1)}%`,
                        height: "100%",
                        borderRadius: 3,
                        backgroundColor: categoryHex(row.color),
                      }}
                    />
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={[styles.card, { flex: 2 }]}>
            <Text style={styles.cardTitle}>{t("report.budgets")}</Text>
            {data.budgets.length === 0 ? (
              <Text style={styles.empty}>{t("dashboard.noBudgets")}</Text>
            ) : (
              data.budgets.map((budget) => {
                const status = budgetStatus(budget.spent, budget.amount);
                const ratio = budget.amount > 0 ? budget.spent / budget.amount : 1;
                return (
                  <View key={budget.id} style={styles.budget} wrap={false}>
                    <View style={styles.barLabels}>
                      <Text style={styles.barName}>{budget.categoryName}</Text>
                      <Text style={[styles.status, { color: STATUS_COLOR[status] }]}>
                        {t(`budgets.status.${status}`)}
                      </Text>
                    </View>
                    <View style={styles.track}>
                      <View
                        style={{
                          width: `${Math.min(ratio, 1) * 100}%`,
                          height: "100%",
                          borderRadius: 3,
                          backgroundColor: STATUS_COLOR[status],
                        }}
                      />
                    </View>
                    <Text style={styles.small}>
                      {t("dashboard.spentOf", {
                        spent: money(budget.spent),
                        limit: money(budget.amount),
                      })}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Every transaction */}
        <View style={styles.tableHeading}>
          <Text style={styles.cardTitle}>{t("report.transactions")}</Text>
          <Text style={styles.small}>{t("report.count", { count: data.transactions.length })}</Text>
        </View>
        {data.transactions.length === 0 ? (
          <Text style={styles.empty}>{t("dashboard.nothingYet", { month: monthName })}</Text>
        ) : (
          <View>
            <View style={styles.tableHead} wrap={false}>
              <Text style={[styles.th, styles.colDate]}>{t("csv.date")}</Text>
              <Text style={[styles.th, styles.colNote]}>{t("report.description")}</Text>
              <Text style={[styles.th, styles.colCategory]}>{t("csv.category")}</Text>
              <Text style={[styles.th, styles.colAmount]}>{t("csv.amount")}</Text>
            </View>
            {data.transactions.map((row, index) => (
              <View
                key={row.id}
                style={[styles.tr, index % 2 === 1 ? { backgroundColor: "#f7fbfa" } : {}]}
                wrap={false}
              >
                <Text style={[styles.td, styles.colDate]}>{formatDate(row.date, locale)}</Text>
                <Text style={[styles.td, styles.colNote]}>{row.note ?? row.category}</Text>
                <View style={[styles.colCategory, styles.categoryCell]}>
                  <View style={[styles.dot, { backgroundColor: categoryHex(row.color) }]} />
                  <Text style={styles.td}>{row.category}</Text>
                </View>
                <Text
                  style={[
                    styles.td,
                    styles.colAmount,
                    { fontWeight: 600, color: row.type === "INCOME" ? GOOD : INK },
                  ]}
                >
                  {money(row.type === "INCOME" ? row.amount : -row.amount, "always")}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

function Total({ label, value, color = INK }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.total}>
      <Text style={styles.totalLabel}>{label}</Text>
      <Text style={[styles.totalValue, { color }]}>{value}</Text>
    </View>
  );
}

/** The app's logo: three rising bars on an emerald tile */
function LogoMark() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Defs>
        <LinearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#34d399" />
          <Stop offset="1" stopColor="#0d9488" />
        </LinearGradient>
      </Defs>
      <Rect width={26} height={26} rx={7} fill="url(#logo)" />
      <Rect x={7} y={14} width={3} height={6} rx={1.5} fill="white" />
      <Rect x={11.5} y={10.5} width={3} height={9.5} rx={1.5} fill="white" />
      <Rect x={16} y={6.5} width={3} height={13.5} rx={1.5} fill="white" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 36,
    fontFamily: ["Geist", "Kantumruy Pro"],
    fontSize: 9,
    color: INK,
    // No lineHeight here: on the Page, react-pdf drops the fixed footer
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandName: { fontSize: 13, fontWeight: 700 },
  headerRight: { alignItems: "flex-end" },
  title: { fontSize: 18, fontWeight: 700, lineHeight: 1.3 },
  month: { fontSize: 11, color: TEAL, fontWeight: 600, lineHeight: 1.3, marginTop: 2 },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    color: MUTED,
  },
  totals: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: MINT,
  },
  total: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: "white" },
  totalLabel: { color: MUTED, fontSize: 8.5 },
  totalValue: { fontSize: 14, fontWeight: 700, marginTop: 2 },
  columns: { flexDirection: "row", gap: 12, marginTop: 14 },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  cardTitle: { fontSize: 11, fontWeight: 700, marginBottom: 8 },
  empty: { color: MUTED, paddingVertical: 8 },
  barRow: { marginBottom: 7 },
  barLabels: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  barName: { flex: 1, fontWeight: 600 },
  barAmount: { fontWeight: 600 },
  barShare: { width: 26, textAlign: "right", color: MUTED },
  track: { height: 5, borderRadius: 3, backgroundColor: "#eef3f1" },
  budget: { marginBottom: 9 },
  status: { fontSize: 8, fontWeight: 600 },
  small: { color: MUTED, fontSize: 8, marginTop: 2 },
  tableHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 18,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { color: "white", fontWeight: 600, fontSize: 8.5 },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f1",
  },
  td: { fontSize: 8.5 },
  colDate: { width: "18%" },
  colNote: { width: "40%", paddingRight: 8 },
  colCategory: { width: "24%" },
  colAmount: { width: "18%", textAlign: "right" },
  categoryCell: { flexDirection: "row", alignItems: "center", gap: 5 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: LINE,
    color: MUTED,
    fontSize: 8,
  },
});
