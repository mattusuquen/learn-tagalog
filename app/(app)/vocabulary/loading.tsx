import { Skeleton } from "@/components/ui/skeleton";

export default function VocabularyLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="rounded-xl border">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="m-3 h-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
