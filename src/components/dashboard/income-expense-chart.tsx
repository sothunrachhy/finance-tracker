"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { MonthTrend } from "@/server/queries/dashboard";

// Categorical slots 1 and 2 (blue, orange): a validated adjacent pair.
// Green/red are reserved for status, so they aren't used for series.
const chartConfig = {
  income: { label: "Income", color: "var(--series-1)" },
  expenses: { label: "Expenses", color: "var(--series-2)" },
} satisfies ChartConfig;

export function IncomeExpenseChart({ data, currency }: { data: MonthTrend[]; currency: string }) {
  // The chart works in major units; the table below keeps exact cents.
  const chartData = data.map((d) => ({
    month: formatMonth(d.month, "short"),
    income: d.income / 100,
    expenses: d.expenses / 100,
  }));

  return (
    <>
      <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full" aria-hidden>
        <BarChart data={chartData} barGap={2} margin={{ left: 0, right: 0, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) => formatMoney(value * 100, currency, { compact: true })}
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
                        {formatMoney(Math.round(Number(item.value) * 100), currency)}
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
        <caption>Income and expenses by month</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Income</th>
            <th scope="col">Expenses</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <th scope="row">{formatMonth(d.month)}</th>
              <td>{formatMoney(d.income, currency)}</td>
              <td>{formatMoney(d.expenses, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
