"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useI18n } from "@/i18n/client";
import { formatMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { niceTicks } from "@/lib/stats";
import type { MonthTrend } from "@/server/queries/dashboard";

/** The chart's legend, small enough for the card header. Same colors as the bars. */
export function ChartLegendKey() {
  const { t } = useI18n();
  return (
    <ul className="text-muted-foreground flex items-center gap-4 text-xs font-medium" aria-hidden>
      <li className="flex items-center gap-1.5">
        <span className="bg-series-1 size-2.5 rounded-full" />
        {t("dashboard.income")}
      </li>
      <li className="flex items-center gap-1.5">
        <span className="bg-series-2 size-2.5 rounded-full" />
        {t("dashboard.expenses")}
      </li>
    </ul>
  );
}

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
        <BarChart data={chartData} barGap={6} margin={{ left: 0, right: 0, top: 8 }}>
          {/* Each bar fades from its full color at the top to a lighter tint */}
          <defs>
            {(["income", "expenses"] as const).map((key) => (
              <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: `var(--color-${key})` }} />
                <stop offset="1" style={{ stopColor: `var(--color-${key})`, stopOpacity: 0.55 }} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 4" />
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
          {/* The legend is in the card header (see ChartLegendKey) */}
          <Bar dataKey="income" fill="url(#fill-income)" radius={[8, 8, 0, 0]} maxBarSize={32} />
          <Bar
            dataKey="expenses"
            fill="url(#fill-expenses)"
            radius={[8, 8, 0, 0]}
            maxBarSize={32}
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
