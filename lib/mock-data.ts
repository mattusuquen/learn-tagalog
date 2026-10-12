// Mock dataset for the UI. Realistic Tagalog vocabulary + derived progress data.
// All dates are computed relative to "now" at module load so the mock never goes
// stale (due dates, streak, heatmap always look current).
//
// TODO(integration): replace the consumers in lib/data.ts with Supabase reads;
// this file goes away.

import type {
  ActivityDay,
  DailyMinutes,
  MasteryLevel,
  PartOfSpeech,
  ReviewEvent,
  ReviewRating,
  StruggleTopic,
  Word,
} from "@/lib/types";

// --- date helpers -----------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** ISO date N days from today (negative = past). */
function daysFromNow(n: number): string {
  return isoDate(new Date(Date.now() + n * DAY_MS));
}

/** Small deterministic PRNG so mock charts are stable across renders. */
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// --- word seeds -------------------------------------------------------------

interface Seed {
  tagalog: string;
  english: string;
  pos: PartOfSpeech;
  exT: string;
  exE: string;
  hint: string;
  mastery: MasteryLevel;
  reviewed: number;
  lapses: number;
  /** days until next review; negative = overdue (due today), null = brand new. */
  dueIn: number | null;
  notes?: string;
}

const SEEDS: Seed[] = [
  { tagalog: "kumusta", english: "hello / how are you", pos: "phrase", exT: "Kumusta ka ngayong umaga?", exE: "How are you this morning?", hint: "koo-moos-TAH", mastery: "mastered", reviewed: 14, lapses: 0, dueIn: 9 },
  { tagalog: "salamat", english: "thank you", pos: "phrase", exT: "Salamat sa tulong mo.", exE: "Thank you for your help.", hint: "sah-LAH-mat", mastery: "mastered", reviewed: 16, lapses: 0, dueIn: 12 },
  { tagalog: "paalam", english: "goodbye", pos: "phrase", exT: "Paalam, kita tayo bukas.", exE: "Goodbye, see you tomorrow.", hint: "pah-AH-lam", mastery: "familiar", reviewed: 7, lapses: 1, dueIn: 2 },
  { tagalog: "oo", english: "yes", pos: "particle", exT: "Oo, gusto ko iyan.", exE: "Yes, I want that.", hint: "OH-oh", mastery: "mastered", reviewed: 20, lapses: 0, dueIn: 15 },
  { tagalog: "hindi", english: "no / not", pos: "particle", exT: "Hindi ako gutom.", exE: "I am not hungry.", hint: "hin-DEE", mastery: "mastered", reviewed: 18, lapses: 0, dueIn: 11 },
  { tagalog: "tubig", english: "water", pos: "noun", exT: "Pwede bang humingi ng tubig?", exE: "May I ask for water?", hint: "TOO-big", mastery: "familiar", reviewed: 6, lapses: 0, dueIn: 1 },
  { tagalog: "kape", english: "coffee", pos: "noun", exT: "Gusto ko ng mainit na kape.", exE: "I want hot coffee.", hint: "kah-PEH", mastery: "familiar", reviewed: 8, lapses: 1, dueIn: 0 },
  { tagalog: "pagkain", english: "food", pos: "noun", exT: "Masarap ang pagkain dito.", exE: "The food here is delicious.", hint: "pag-KAH-in", mastery: "learning", reviewed: 3, lapses: 1, dueIn: 0 },
  { tagalog: "bahay", english: "house", pos: "noun", exT: "Malaki ang bahay nila.", exE: "Their house is big.", hint: "BAH-hai", mastery: "familiar", reviewed: 5, lapses: 0, dueIn: 3 },
  { tagalog: "pera", english: "money", pos: "noun", exT: "Wala akong pera ngayon.", exE: "I have no money right now.", hint: "PEH-rah", mastery: "learning", reviewed: 2, lapses: 0, dueIn: -1 },
  { tagalog: "kaibigan", english: "friend", pos: "noun", exT: "Matalik kong kaibigan si Ana.", exE: "Ana is my close friend.", hint: "ka-ee-BEE-gan", mastery: "learning", reviewed: 4, lapses: 2, dueIn: 0, notes: "Root: ibig (to desire/love)." },
  { tagalog: "guro", english: "teacher", pos: "noun", exT: "Mabait ang aming guro.", exE: "Our teacher is kind.", hint: "GOO-roh", mastery: "familiar", reviewed: 6, lapses: 0, dueIn: 4 },
  { tagalog: "aklat", english: "book", pos: "noun", exT: "Binabasa ko ang aklat.", exE: "I am reading the book.", hint: "AK-lat", mastery: "learning", reviewed: 3, lapses: 1, dueIn: -2, notes: "More formal than 'libro'." },
  { tagalog: "maganda", english: "beautiful", pos: "adjective", exT: "Napakaganda ng tanawin.", exE: "The view is very beautiful.", hint: "ma-gan-DAH", mastery: "mastered", reviewed: 12, lapses: 0, dueIn: 8 },
  { tagalog: "mabait", english: "kind", pos: "adjective", exT: "Mabait siya sa lahat.", exE: "They are kind to everyone.", hint: "ma-BAH-it", mastery: "familiar", reviewed: 7, lapses: 0, dueIn: 2 },
  { tagalog: "masaya", english: "happy", pos: "adjective", exT: "Masaya ako ngayon.", exE: "I am happy today.", hint: "ma-sa-YAH", mastery: "familiar", reviewed: 9, lapses: 1, dueIn: 5 },
  { tagalog: "malaki", english: "big / large", pos: "adjective", exT: "Malaki ang aso nila.", exE: "Their dog is big.", hint: "ma-la-KEE", mastery: "learning", reviewed: 3, lapses: 0, dueIn: 1 },
  { tagalog: "maliit", english: "small", pos: "adjective", exT: "Maliit lang ang kwarto ko.", exE: "My room is just small.", hint: "ma-lee-IT", mastery: "learning", reviewed: 2, lapses: 0, dueIn: -1 },
  { tagalog: "kumain", english: "to eat", pos: "verb", exT: "Kumain na ba kayo?", exE: "Have you all eaten?", hint: "koo-MAH-in", mastery: "learning", reviewed: 5, lapses: 2, dueIn: 0, notes: "-um- infix on kain." },
  { tagalog: "uminom", english: "to drink", pos: "verb", exT: "Uminom ka ng tubig.", exE: "Drink some water.", hint: "oo-MEE-nom", mastery: "learning", reviewed: 4, lapses: 2, dueIn: -1, notes: "-um- infix on inom." },
  { tagalog: "matulog", english: "to sleep", pos: "verb", exT: "Matulog ka nang maaga.", exE: "Sleep early.", hint: "ma-TOO-log", mastery: "learning", reviewed: 3, lapses: 1, dueIn: 0 },
  { tagalog: "pumunta", english: "to go", pos: "verb", exT: "Pumunta tayo sa palengke.", exE: "Let's go to the market.", hint: "poo-MOON-tah", mastery: "learning", reviewed: 4, lapses: 2, dueIn: 0, notes: "-um- infix; tricky conjugation." },
  { tagalog: "magluto", english: "to cook", pos: "verb", exT: "Magluluto ako ng hapunan.", exE: "I will cook dinner.", hint: "mag-LOO-toh", mastery: "new", reviewed: 0, lapses: 0, dueIn: null },
  { tagalog: "magbasa", english: "to read", pos: "verb", exT: "Magbasa tayo ng kwento.", exE: "Let's read a story.", hint: "mag-BAH-sah", mastery: "new", reviewed: 0, lapses: 0, dueIn: null },
  { tagalog: "bumili", english: "to buy", pos: "verb", exT: "Bumili ako ng gulay.", exE: "I bought vegetables.", hint: "boo-MEE-lee", mastery: "learning", reviewed: 3, lapses: 1, dueIn: 1 },
  { tagalog: "ngayon", english: "now / today", pos: "adverb", exT: "Ngayon na tayo umalis.", exE: "Let's leave now.", hint: "nga-YON", mastery: "familiar", reviewed: 6, lapses: 0, dueIn: 3 },
  { tagalog: "bukas", english: "tomorrow", pos: "adverb", exT: "Bukas ang pasukan.", exE: "Classes start tomorrow.", hint: "BOO-kas", mastery: "familiar", reviewed: 5, lapses: 0, dueIn: 2 },
  { tagalog: "kahapon", english: "yesterday", pos: "adverb", exT: "Kahapon pa ako dumating.", exE: "I arrived yesterday.", hint: "ka-HA-pon", mastery: "learning", reviewed: 2, lapses: 0, dueIn: -2 },
  { tagalog: "dito", english: "here", pos: "adverb", exT: "Dito ka lang muna.", exE: "Just stay here for now.", hint: "DEE-toh", mastery: "familiar", reviewed: 7, lapses: 0, dueIn: 4 },
  { tagalog: "ako", english: "I / me", pos: "pronoun", exT: "Ako ang magbabayad.", exE: "I will be the one to pay.", hint: "a-KOH", mastery: "mastered", reviewed: 15, lapses: 0, dueIn: 10 },
  { tagalog: "ikaw", english: "you", pos: "pronoun", exT: "Ikaw ba ang kausap ko?", exE: "Are you the one I'm talking to?", hint: "ee-KAW", mastery: "mastered", reviewed: 13, lapses: 0, dueIn: 7 },
  { tagalog: "po", english: "(politeness particle)", pos: "particle", exT: "Salamat po sa inyo.", exE: "Thank you (politely).", hint: "poh", mastery: "familiar", reviewed: 8, lapses: 1, dueIn: 1, notes: "Adds respect; pair with 'opo' for 'yes'." },
  { tagalog: "magkano", english: "how much", pos: "phrase", exT: "Magkano ito?", exE: "How much is this?", hint: "mag-KAH-no", mastery: "learning", reviewed: 3, lapses: 1, dueIn: 0 },
  { tagalog: "palengke", english: "market", pos: "noun", exT: "Mura ang prutas sa palengke.", exE: "Fruit is cheap at the market.", hint: "pa-LENG-keh", mastery: "new", reviewed: 0, lapses: 0, dueIn: null },
];

/** Build a short plausible review history ending most-recently. */
function buildHistory(reviewed: number, lapses: number): ReviewEvent[] {
  const n = Math.min(reviewed, 4);
  const events: ReviewEvent[] = [];
  let remainingLapses = lapses;
  for (let i = 0; i < n; i++) {
    // Most recent first in time terms, spaced a few days apart going back.
    const daysAgo = (n - i) * 3;
    let rating: ReviewRating = "good";
    if (remainingLapses > 0 && i < 2) {
      rating = "again";
      remainingLapses--;
    } else if (i === n - 1) {
      rating = "easy";
    } else if (i % 2 === 0) {
      rating = "hard";
    }
    events.push({ date: daysFromNow(-daysAgo), rating });
  }
  return events;
}

export const WORDS: Word[] = SEEDS.map((s, i) => {
  const lastReviewed = s.reviewed > 0 ? daysFromNow(-((s.dueIn ?? 0) >= 0 ? 3 : 1)) : null;
  return {
    id: `w${i + 1}`,
    tagalog: s.tagalog,
    english: s.english,
    partOfSpeech: s.pos,
    exampleTagalog: s.exT,
    exampleEnglish: s.exE,
    pronunciationHint: s.hint,
    notes: s.notes,
    mastery: s.mastery,
    timesReviewed: s.reviewed,
    lapses: s.lapses,
    lastReviewed,
    nextReview: s.dueIn === null ? null : daysFromNow(s.dueIn),
    history: buildHistory(s.reviewed, s.lapses),
    createdAt: daysFromNow(-(30 + i)),
  };
});

// --- progress series --------------------------------------------------------

/** Last 30 days of practice minutes (oldest first), deterministic. */
export const MINUTES_PER_DAY: DailyMinutes[] = (() => {
  const rand = seeded(42);
  const out: DailyMinutes[] = [];
  for (let i = 29; i >= 0; i--) {
    const r = rand();
    // ~1 in 6 days skipped; otherwise 8–38 minutes.
    const minutes = r < 0.16 ? 0 : Math.round(8 + rand() * 30);
    out.push({ date: daysFromNow(-i), minutes });
  }
  return out;
})();

/** ~16 weeks (112 days) of activity counts for the heatmap, oldest first. */
export const ACTIVITY: ActivityDay[] = (() => {
  const rand = seeded(7);
  const out: ActivityDay[] = [];
  for (let i = 111; i >= 0; i--) {
    const r = rand();
    const count = r < 0.3 ? 0 : Math.min(4, 1 + Math.floor(rand() * 4));
    out.push({ date: daysFromNow(-i), count });
  }
  return out;
})();

export const STRUGGLE_TOPICS: StruggleTopic[] = [
  { topic: "-um- verb conjugation", progress: 42 },
  { topic: "Polite particles (po / opo)", progress: 68 },
  { topic: "Ng vs. nang", progress: 35 },
  { topic: "Numbers 11–100", progress: 55 },
  { topic: "Focus / trigger system", progress: 21 },
];

/** Static lesson topic the tutor is working on — shown on Home. */
export const TODAY_TOPIC = "At the coffee shop";

export const DAY_STREAK = 12;
