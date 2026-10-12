"use client";

import Link from "next/link";
import { GraduationCap, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { speakTagalog } from "@/lib/speak";
import type { Word } from "@/lib/types";

import { MasteryBadge } from "./columns";

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WordSheet({
  word,
  open,
  onOpenChange,
}: {
  word: Word | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        {word && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-2xl">{word.tagalog}</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Play pronunciation of ${word.tagalog}`}
                  onClick={() => speakTagalog(word.tagalog)}
                >
                  <Volume2 className="size-4" />
                </Button>
              </div>
              <SheetDescription className="text-base">
                {word.english}
              </SheetDescription>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {word.partOfSpeech}
                </Badge>
                <MasteryBadge level={word.mastery} />
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
              {word.exampleTagalog && (
                <section>
                  <h3 className="mb-1 text-sm font-semibold">Example</h3>
                  <p className="font-medium">{word.exampleTagalog}</p>
                  <p className="text-sm text-muted-foreground">
                    {word.exampleEnglish}
                  </p>
                </section>
              )}

              {word.pronunciationHint && (
                <section>
                  <h3 className="mb-1 text-sm font-semibold">Pronunciation</h3>
                  <p className="text-sm text-muted-foreground">
                    {word.pronunciationHint}
                  </p>
                </section>
              )}

              {word.notes && (
                <section>
                  <h3 className="mb-1 text-sm font-semibold">Notes</h3>
                  <p className="text-sm text-muted-foreground">{word.notes}</p>
                </section>
              )}

              <Separator />

              <section className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Reviews" value={word.timesReviewed} />
                <Stat label="Lapses" value={word.lapses} />
                <Stat label="Next" value={formatDate(word.nextReview)} />
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">Review history</h3>
                {word.history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {word.history.map((event, i) => (
                      <li
                        key={`${event.date}-${i}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {formatDate(event.date)}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {event.rating}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <SheetFooter>
              <Button asChild>
                <Link href="/practice">
                  <GraduationCap /> Practice this word
                </Link>
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-2">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
