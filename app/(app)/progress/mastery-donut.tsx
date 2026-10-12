"use client";

import { Label, Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { MasteryBreakdown, MasteryLevel } from "@/lib/types";

// Mastery is ORDERED (new → mastered), so a single-hue emerald ramp (light→dark)
// encodes it, not arbitrary categorical colors.
const RAMP: Record<MasteryLevel, string> = {
  new: "#d1fae5",
  learning: "#6ee7b7",
  familiar: "#10b981",
  mastered: "#047857",
};

const config = {
  new: { label: "New", color: RAMP.new },
  learning: { label: "Learning", color: RAMP.learning },
  familiar: { label: "Familiar", color: RAMP.familiar },
  mastered: { label: "Mastered", color: RAMP.mastered },
} satisfies ChartConfig;

export function MasteryDonut({ data }: { data: MasteryBreakdown[] }) {
  const chartData = data.map((d) => ({
    level: d.level,
    count: d.count,
    fill: RAMP[d.level],
  }));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <ChartContainer config={config} className="aspect-square h-[200px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="level" hideLabel />} />
          <Pie data={chartData} dataKey="count" nameKey="level" innerRadius={55} strokeWidth={2}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
                      {total}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                      words
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-1">
        {data.map((d) => (
          <li key={d.level} className="flex items-center gap-2">
            <span className="size-3 rounded-sm" style={{ backgroundColor: RAMP[d.level] }} />
            <span className="capitalize text-muted-foreground">{d.level}</span>
            <span className="ml-auto font-medium tabular-nums">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
