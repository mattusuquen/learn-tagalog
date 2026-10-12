import { getDecks } from "@/lib/data";

import { FlashcardPractice } from "./flashcard-practice";

// Practice — spaced-repetition flashcards. Server component fetches the decks;
// the interactive run lives in the FlashcardPractice client island.
export default async function PracticePage() {
  const decks = await getDecks();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
        <p className="text-sm text-muted-foreground">
          Flip through your cards and rate how well you knew each one.
        </p>
      </div>

      <FlashcardPractice decks={decks} />
    </div>
  );
}
