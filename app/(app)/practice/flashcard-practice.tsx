"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { speakTagalog } from "@/lib/speak";
import { cn } from "@/lib/utils";
import type { Deck, DeckId, Flashcard, ReviewRating } from "@/lib/types";

// Ratings are SESSION-ONLY (learner decision): they drive the run + summary but
// do not mutate the underlying word state.

const RATINGS: {
  rating: ReviewRating;
  label: string;
  hotkey: string;
  className: string;
}[] = [
  { rating: "again", label: "Again", hotkey: "1", className: "border-destructive/40 text-destructive hover:bg-destructive/10" },
  { rating: "hard", label: "Hard", hotkey: "2", className: "border-amber-500/40 text-amber-700 hover:bg-amber-500/10" },
  { rating: "good", label: "Good", hotkey: "3", className: "border-primary/40 text-primary hover:bg-primary/10" },
  { rating: "easy", label: "Easy", hotkey: "4", className: "border-emerald-600/40 text-emerald-700 hover:bg-emerald-600/10" },
];

export function FlashcardPractice({ decks }: { decks: Deck[] }) {
  const [deckId, setDeckId] = useState<DeckId>(decks[0]?.id ?? "due");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<ReviewRating[]>([]);

  const deck = decks.find((d) => d.id === deckId) ?? decks[0];
  const cards = deck?.cards ?? [];
  const current: Flashcard | undefined = cards[index];
  const done = cards.length > 0 && index >= cards.length;

  const reset = useCallback(() => {
    setIndex(0);
    setFlipped(false);
    setResults([]);
  }, []);

  const changeDeck = useCallback(
    (id: string) => {
      setDeckId(id as DeckId);
      reset();
    },
    [reset],
  );

  const rate = useCallback(
    (rating: ReviewRating) => {
      setResults((prev) => [...prev, rating]);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [],
  );

  // Keyboard: space flips; 1–4 rate once flipped.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done || !current) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      const match = RATINGS.find((r) => r.hotkey === e.key);
      if (match) {
        e.preventDefault();
        rate(match.rating);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, current, flipped, rate]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Tabs value={deckId} onValueChange={changeDeck} className="mb-6">
        <TabsList className="w-full">
          {decks.map((d) => (
            <TabsTrigger key={d.id} value={d.id} className="flex-1 gap-1.5">
              {d.label}
              <Badge variant="secondary" className="px-1.5 py-0 text-xs tabular-nums">
                {d.cards.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {cards.length === 0 ? (
        <EmptyDeck description={deck?.description ?? ""} />
      ) : done ? (
        <SessionSummary results={results} total={cards.length} onRestart={reset} />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span className="tabular-nums">
              {index + 1} of {cards.length}
            </span>
            <span className="tabular-nums">{cards.length - index} remaining</span>
          </div>
          <Progress value={(index / cards.length) * 100} className="mb-6 h-1.5" />

          {current && (
            <FlipCard card={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          )}

          <div className="mt-6">
            {flipped ? (
              <div className="grid grid-cols-4 gap-2">
                {RATINGS.map((r) => (
                  <Button
                    key={r.rating}
                    variant="outline"
                    className={cn("h-auto flex-col gap-0.5 py-2", r.className)}
                    onClick={() => rate(r.rating)}
                  >
                    <span className="font-medium">{r.label}</span>
                    <span className="text-xs opacity-60">{r.hotkey}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Tap the card or press{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">Space</kbd>{" "}
                to flip
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function FlipCard({
  card,
  flipped,
  onFlip,
}: {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div className="[perspective:1200px]">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label="Flashcard — activate to flip"
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter") onFlip();
        }}
        className="relative h-80 w-full cursor-pointer rounded-xl transition-transform duration-500 outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:duration-0"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front: Tagalog */}
        <Card className="absolute inset-0 flex flex-col items-center justify-center gap-4 [backface-visibility:hidden]">
          <Badge variant="secondary">{card.partOfSpeech}</Badge>
          <div className="text-4xl font-semibold tracking-tight">{card.tagalog}</div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Play pronunciation of ${card.tagalog}`}
            onClick={(e) => {
              e.stopPropagation();
              speakTagalog(card.tagalog);
            }}
          >
            <Volume2 />
          </Button>
        </Card>

        {/* Back: meaning + example + hint */}
        <Card className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="text-2xl font-semibold">{card.english}</div>
          {card.exampleTagalog && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{card.exampleTagalog}</p>
              <p>{card.exampleEnglish}</p>
            </div>
          )}
          {card.pronunciationHint && (
            <p className="text-xs text-muted-foreground">
              Say it like: <span className="font-medium">{card.pronunciationHint}</span>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function SessionSummary({
  results,
  total,
  onRestart,
}: {
  results: ReviewRating[];
  total: number;
  onRestart: () => void;
}) {
  const count = (r: ReviewRating) => results.filter((x) => x === r).length;
  return (
    <Card className="flex flex-col items-center gap-6 p-10 text-center">
      <div>
        <div className="text-2xl font-semibold">Session complete</div>
        <p className="text-sm text-muted-foreground">
          You reviewed {total} {total === 1 ? "card" : "cards"}.
        </p>
      </div>
      <div className="grid w-full max-w-sm grid-cols-4 gap-2">
        {RATINGS.map((r) => (
          <div key={r.rating} className="rounded-lg border p-3">
            <div className="text-xl font-semibold tabular-nums">{count(r.rating)}</div>
            <div className="text-xs text-muted-foreground">{r.label}</div>
          </div>
        ))}
      </div>
      <Button onClick={onRestart}>
        <RotateCcw /> Practice again
      </Button>
    </Card>
  );
}

function EmptyDeck({ description }: { description: string }) {
  return (
    <Card className="flex flex-col items-center gap-2 p-12 text-center">
      <div className="text-lg font-semibold">All caught up</div>
      <p className="max-w-xs text-sm text-muted-foreground">
        {description
          ? `No cards here right now — ${description.toLowerCase()}.`
          : "No cards in this deck right now."}
      </p>
    </Card>
  );
}
