import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Shown while the server component fetches today's focus.
export default function HomeLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-6 py-8">
              <Skeleton className="size-28 rounded-full" />
              <Skeleton className="h-16 w-full max-w-sm" />
              <Skeleton className="h-14 w-44 rounded-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
