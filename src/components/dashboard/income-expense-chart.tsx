"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { useI18n } from "@/i18n/client";
import { formatMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { niceTicks } from "@/lib/stats";
import type { MonthTrend } from "@/server/queries/dashboard";

export function IncomeExpenseChart({ data, currency }: { data: MonthTrend[]; currency: string }) {
  const { locale, t } = useI18n();

  // Categorical slots 1 and 2 (blue, orange): a validated adjacent pair.
  // Green/red are reserved for status, so they aren't used for series.
  const chartConfig = {
    income: { label: t("dashboard.income"), color: "var(--series-1)" },
    expenses: { label: t("dashboard.expenses"), color: "var(--series-2)" },
  } satisfies ChartConfig;

  // The chart works in major units; the table below keeps exact cents.
  const chartData = data.map((d) => ({
    month: formatMonth(d.month, "short", locale),
    income: d.income / 100,
    expenses: d.expenses / 100,
  }));
  const ticks = niceTicks(Math.max(...chartData.flatMap((d) => [d.income, d.expenses])));

  // With no data the axis would show a meaningless $0–$4 scale
  if (ticks.length === 1) {
    return (
      <p className="text-muted-foreground flex h-72 items-center justify-center text-center text-sm">
        {t("dashboard.noChartData")}
      </p>
    );
  }

  return (
    <>
      <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full" aria-hidden>
        <BarChart data={chartData} barGap={2} margin={{ left: 0, right: 0, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            width={56}
            tickFormatter={(value: number) =>
              formatMoney(value * 100, currency, { compact: true, locale })
            }
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="bg-popover grid min-w-40 gap-1.5 rounded-lg border px-3 py-2 text-xs shadow-md">
                  <p className="font-medium">{label}</p>
                  {payload.map((item) => (
                    <div key={item.dataKey as string} className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground flex-1">
                        {chartConfig[item.dataKey as keyof typeof chartConfig].label}
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatMoney(Math.round(Number(item.value) * 100), currency, { locale })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null
            }
          />
          {/* itemSorter={null} keeps legend order = bar order (default sorts A-Z) */}
          <ChartLegend content={<ChartLegendContent />} itemSorter={null} />
          <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar
            dataKey="expenses"
            fill="var(--color-expenses)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ChartContainer>

      {/* Same data as a table for screen readers */}
      <table className="sr-only">
        <caption>{t("dashboard.chartCaption")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("dashboard.month")}</th>
            <th scope="col">{t("dashboard.income")}</th>
            <th scope="col">{t("dashboard.expenses")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <th scope="row">{formatMonth(d.month, "long", locale)}</th>
              <td>{formatMoney(d.income, currency, { locale })}</td>
              <td>{formatMoney(d.expenses, currency, { locale })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
