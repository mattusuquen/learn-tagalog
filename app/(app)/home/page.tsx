import LessonCard from "./lesson-card";

// Practice — the live tutoring screen. The page stays a server component and
// renders the static lesson header; the interactive session lives in the
// LessonCard client island. Steps/progress/timer are decorative (Pile A).
export default function PracticePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">


      <LessonCard />


    </div>
  );
}
