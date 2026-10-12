import { Sparkles, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTodayFocus } from "@/lib/data";
import type { TodayFocus } from "@/lib/types";

import { VoiceAgent } from "./voice-agent";

// Home — the core voice-coaching screen. Stays a server component: it fetches
// today's focus and renders the layout, while the live session lives in the
// VoiceAgent client island.
export default async function HomePage() {
  const focus = await getTodayFocus();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Talk with Kuya</h1>
        <p className="text-sm text-muted-foreground">
          Practice speaking Tagalog in a live conversation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VoiceAgent />
        </div>
        <aside className="lg:col-span-1">
          <TodayFocusCard focus={focus} />
        </aside>
      </div>
    </div>
  );
}

function TodayFocusCard({ focus }: { focus: TodayFocus }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          Today&apos;s focus
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="rounded-xl bg-accent p-4">
          <div className="text-xs font-medium text-accent-foreground/70">
            Current lesson
          </div>
          <div className="text-lg font-semibold text-accent-foreground">
            {focus.topic}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Target className="size-4 text-muted-foreground" />
            Working on
          </div>
          <ul className="flex flex-col gap-3">
            {focus.struggleTopics.map((topic) => (
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
        </div>
      </CardContent>
    </Card>
  );
}
