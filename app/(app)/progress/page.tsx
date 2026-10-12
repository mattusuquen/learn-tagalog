import { Clock, Flame, Sparkles, Target, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProgressStats } from "@/lib/data";

import { ActivityHeatmap } from "./activity-heatmap";
import { MasteryDonut } from "./mastery-donut";
import { MinutesChart } from "./minutes-chart";
import { WordsLearnedChart } from "./words-learned-chart";

export default async function ProgressPage() {
  const stats = await getProgressStats();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground">
          Your learning over time.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Flame className="size-4 text-primary" />} label="Day streak" value={`${stats.dayStreak}`} />
        <StatCard icon={<Sparkles className="size-4 text-primary" />} label="Words learned" value={`${stats.wordsLearned}`} />
        <StatCard icon={<Clock className="size-4 text-primary" />} label="Minutes this week" value={`${stats.minutesThisWeek}`} />
        <StatCard icon={<Target className="size-4 text-primary" />} label="Mastered" value={`${stats.wordsMasteredPct}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-muted-foreground" />
              Words learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WordsLearnedChart data={stats.wordsLearnedSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Practice minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <MinutesChart data={stats.minutesPerDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vocabulary by mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <MasteryDonut data={stats.masteryBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-muted-foreground" />
              Struggle topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {stats.struggleTopics.map((topic) => (
                <li key={topic.topic} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{topic.topic}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {topic.progress}%
                    </span>
                  </div>
                  <Progress value={topic.progress} className="h-1.5" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap activity={stats.activity} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
