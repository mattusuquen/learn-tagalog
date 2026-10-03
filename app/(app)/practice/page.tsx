import LessonCard from "./lesson-card";

// Practice — the live tutoring screen. The page stays a server component and
// renders the static lesson header; the interactive session lives in the
// LessonCard client island. Steps/progress/timer are decorative (Pile A).
export default function PracticePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      {/* Static lesson header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#15803d]">
              Ordering drinks
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1a1a1a]">
              Let&apos;s practice together.
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Your AI tutor will guide you through a natural conversation.
            </p>
          </div>
          <div className="shrink-0 pt-1 text-sm text-[#9ca3af]">
            <span className="font-semibold text-[#1a1a1a]">1</span> / 5
          </div>
        </div>

        {/* Progress bar (static: step 1 of 5) */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
          <div className="h-full w-1/5 rounded-full bg-[#15803d]" />
        </div>
      </div>

      <LessonCard />

      {/* Below-card status row (static) */}
      <div className="mt-3 flex items-center justify-between text-xs text-[#9ca3af]">
        <span className="flex items-center gap-1">
          <span className="text-[#15803d]">✓</span> Voice recognition ready
        </span>
        <span>About 4 minutes left</span>
      </div>
    </div>
  );
}
