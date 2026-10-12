import type { ActivityDay } from "@/lib/types";

// Sequential green ramp by activity count (0 = empty/muted → 4 = darkest).
const SCALE = ["var(--muted)", "#d1fae5", "#86efac", "#34d399", "#059669"];

function color(count: number): string {
  return SCALE[Math.min(count, SCALE.length - 1)];
}

function label(date: string, count: number): string {
  const d = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${d}: ${count} ${count === 1 ? "session" : "sessions"}`;
}

// Static grid (no client JS): 7 rows (weekday) flowing by column (weeks). Native
// title tooltips on each cell.
export function ActivityHeatmap({ activity }: { activity: ActivityDay[] }) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {activity.map((day) => (
            <div
              key={day.date}
              title={label(day.date, day.count)}
              className="size-3 rounded-sm"
              style={{ backgroundColor: color(day.count) }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {SCALE.map((c) => (
          <span key={c} className="size-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
