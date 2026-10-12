import { Skeleton } from "@/components/ui/skeleton";

export default function PracticeLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    </div>
  );
}
