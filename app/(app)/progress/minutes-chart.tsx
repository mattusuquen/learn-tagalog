"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyMinutes } from "@/lib/types";

const config = {
  minutes: { label: "Minutes", color: "var(--chart-1)" },
} satisfies ChartConfig;

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function MinutesChart({ data }: { data: DailyMinutes[] }) {
  const [range, setRange] = useState<"7" | "30">("7");
  const shown = range === "7" ? data.slice(-7) : data;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Tabs value={range} onValueChange={(v) => setRange(v as "7" | "30")}>
          <TabsList>
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ChartContainer config={config} className="h-[220px] w-full">
        <BarChart data={shown} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={range === "7" ? 4 : 24}
          />
          <YAxis hide />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_, p) => shortDate(String(p?.[0]?.payload?.date))}
              />
            }
          />
          <Bar dataKey="minutes" fill="var(--color-minutes)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
