import { getWords } from "@/lib/data";

import { VocabTable } from "./vocab-table";

// Vocabulary — the word bank. Server component fetches the words; the
// interactive table (search/filter/sort, detail sheet, add dialog) is a client
// island seeded with that data.
export default async function VocabularyPage() {
  const words = await getWords();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Vocabulary</h1>
        <p className="text-sm text-muted-foreground">
          Your word bank — search, filter, and review any word.
        </p>
      </div>

      <VocabTable initialWords={words} />
    </div>
  );
}
