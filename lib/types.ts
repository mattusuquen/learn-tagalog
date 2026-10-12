// Domain types for the Tagalog voice-coach UI.
//
// Design decision (option B): a single `Word` entity carries BOTH the dictionary
// content and the per-user SRS study state. A `Flashcard` is just a `Word`
// presented for study (a view, not a separate record). Decks are NOT stored —
// they are derived at read time in lib/data.ts from each word's state.
//
// When this moves to Supabase, these shapes are what lib/data.ts maps rows into,
// so components never change.

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "particle"
  | "phrase";

/** Fixed mastery buckets — the Vocabulary badge and the Progress donut both read this. */
export type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

/** SRS rating given after flipping a card (keyboard 1–4). */
export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface ReviewEvent {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  rating: ReviewRating;
}

export interface Word {
  id: string;
  tagalog: string;
  english: string;
  partOfSpeech: PartOfSpeech;
  exampleTagalog: string;
  exampleEnglish: string;
  /** Rough phonetic hint, e.g. "kah-PEH". */
  pronunciationHint: string;
  notes?: string;

  // --- per-user SRS study state (combined into the word, option B) ---
  mastery: MasteryLevel;
  timesReviewed: number;
  /** Times rated "again" — feeds the "Struggling" deck and struggle topics. */
  lapses: number;
  /** ISO date of the last review, or null if never studied. */
  lastReviewed: string | null;
  /** ISO date the card is next due, or null if unscheduled (brand new). */
  nextReview: string | null;
  history: ReviewEvent[];
  /** ISO date the word was added. */
  createdAt: string;
}

/** A card shown in Practice is just a Word (option B). */
export type Flashcard = Word;

export type DeckId = "due" | "new" | "struggling";

export interface Deck {
  id: DeckId;
  label: string;
  description: string;
  cards: Flashcard[];
}

// --- Voice session (Home) ---
// Driven by the REAL ElevenLabs session via useVoiceSession(). The SDK emits a
// single text string per turn with no separate English gloss, so a turn holds
// just `text`.

export type TranscriptRole = "tutor" | "learner";

export interface TranscriptTurn {
  id: string;
  role: TranscriptRole;
  text: string;
  /** ms epoch when the turn arrived. */
  timestamp: number;
}

export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "ended";

export interface Session {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  topic: string;
}

/** What the tutor is focusing on today — shown on Home's "Today's focus" card. */
export interface TodayFocus {
  topic: string;
  struggleTopics: StruggleTopic[];
}

// --- Progress page (all mocked) ---

export interface DailyMinutes {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  minutes: number;
}

export interface MasteryBreakdown {
  level: MasteryLevel;
  count: number;
}

export interface StruggleTopic {
  topic: string;
  /** 0–100 progress toward resolving the struggle. */
  progress: number;
}

export interface ActivityDay {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Sessions/reviews that day — drives the heatmap intensity. */
  count: number;
}

export interface ProgressStats {
  dayStreak: number;
  wordsLearned: number;
  minutesThisWeek: number;
  /** Replaces the spec's "avg pronunciation score" (no pronunciation feedback). */
  wordsMasteredPct: number;
  /** Last 30 days, oldest first. */
  minutesPerDay: DailyMinutes[];
  masteryBreakdown: MasteryBreakdown[];
  struggleTopics: StruggleTopic[];
  /** ~16 weeks of activity, oldest first — for the heatmap grid. */
  activity: ActivityDay[];
}
