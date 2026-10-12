// Data access layer. Every page reads through these async functions. Today they
// return mock data; swapping to Supabase is meant to be a one-file change here —
// keep the return shapes (lib/types.ts) identical and components won't notice.
//
// TODO(integration): replace each body with a Supabase query (see utils/supabase).

import type {
  Deck,
  DeckId,
  Flashcard,
  MasteryBreakdown,
  MasteryLevel,
  PartOfSpeech,
  ProgressStats,
  TodayFocus,
  Word,
} from "@/lib/types";
import {
  ACTIVITY,
  DAY_STREAK,
  MINUTES_PER_DAY,
  STRUGGLE_TOPICS,
  TODAY_TOPIC,
  WORDS,
} from "@/lib/mock-data";

// In-memory copy so addWord() has somewhere to land during a session. Replaced
// by real persistence later.
let words: Word[] = [...WORDS];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

// Simulate a small async boundary so loading states are exercised in dev.
const tick = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function getWords(): Promise<Word[]> {
  return tick([...words]);
}

export async function getWord(id: string): Promise<Word | null> {
  return tick(words.find((w) => w.id === id) ?? null);
}

export interface NewWordInput {
  tagalog: string;
  english: string;
  partOfSpeech: PartOfSpeech;
  exampleTagalog?: string;
  exampleEnglish?: string;
  pronunciationHint?: string;
  notes?: string;
}

export async function addWord(input: NewWordInput): Promise<Word> {
  const word: Word = {
    id: `w${Date.now()}`,
    tagalog: input.tagalog,
    english: input.english,
    partOfSpeech: input.partOfSpeech,
    exampleTagalog: input.exampleTagalog ?? "",
    exampleEnglish: input.exampleEnglish ?? "",
    pronunciationHint: input.pronunciationHint ?? "",
    notes: input.notes,
    mastery: "new",
    timesReviewed: 0,
    lapses: 0,
    lastReviewed: null,
    nextReview: null,
    history: [],
    createdAt: todayIso(),
  };
  words = [word, ...words];
  return tick(word);
}

// --- decks (derived, not stored) --------------------------------------------

function cardsFor(id: DeckId, all: Word[]): Flashcard[] {
  const today = todayIso();
  switch (id) {
    case "due":
      return all.filter((w) => w.nextReview !== null && w.nextReview <= today);
    case "new":
      return all.filter((w) => w.mastery === "new" || w.timesReviewed === 0);
    case "struggling":
      return all.filter((w) => w.lapses >= 2);
  }
}

const DECK_META: Record<DeckId, { label: string; description: string }> = {
  due: { label: "Due today", description: "Cards scheduled for review" },
  new: { label: "New", description: "Words you haven't studied yet" },
  struggling: { label: "Struggling", description: "Words you keep missing" },
};

export async function getDecks(): Promise<Deck[]> {
  const ids: DeckId[] = ["due", "new", "struggling"];
  return tick(
    ids.map((id) => ({
      id,
      label: DECK_META[id].label,
      description: DECK_META[id].description,
      cards: cardsFor(id, words),
    })),
  );
}

export async function getDeck(id: DeckId): Promise<Deck | null> {
  const decks = await getDecks();
  return decks.find((d) => d.id === id) ?? null;
}

export async function getDueCards(): Promise<Flashcard[]> {
  return tick(cardsFor("due", words));
}

// --- progress ----------------------------------------------------------------

const MASTERY_ORDER: MasteryLevel[] = ["new", "learning", "familiar", "mastered"];

export async function getProgressStats(): Promise<ProgressStats> {
  const breakdown: MasteryBreakdown[] = MASTERY_ORDER.map((level) => ({
    level,
    count: words.filter((w) => w.mastery === level).length,
  }));

  const total = words.length;
  const mastered = words.filter((w) => w.mastery === "mastered").length;
  const wordsLearned = words.filter((w) => w.mastery !== "new").length;
  const minutesThisWeek = MINUTES_PER_DAY.slice(-7).reduce((s, d) => s + d.minutes, 0);

  // Cumulative growth curve ending at the current words-learned count. easeOut
  // gives a plausible "fast start, leveling off" shape; monotonic by construction.
  const n = MINUTES_PER_DAY.length;
  const wordsLearnedSeries = MINUTES_PER_DAY.map((d, i) => {
    const t = (i + 1) / n;
    return { date: d.date, value: Math.round(wordsLearned * (1 - (1 - t) ** 2)) };
  });

  return tick({
    dayStreak: DAY_STREAK,
    wordsLearned,
    minutesThisWeek,
    wordsMasteredPct: total === 0 ? 0 : Math.round((mastered / total) * 100),
    wordsLearnedSeries,
    minutesPerDay: MINUTES_PER_DAY,
    masteryBreakdown: breakdown,
    struggleTopics: STRUGGLE_TOPICS,
    activity: ACTIVITY,
  });
}

export async function getTodayFocus(): Promise<TodayFocus> {
  // Surface the three weakest struggle topics alongside today's lesson.
  const struggleTopics = [...STRUGGLE_TOPICS]
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3);
  return tick({ topic: TODAY_TOPIC, struggleTopics });
}
