import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LogSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in-50 duration-300" aria-busy="true" aria-label="Loading reading form">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-8 w-60 sm:w-72" />
        </div>
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Tip Alert Skeleton */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3">
        <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>

      {/* Card Form Skeleton */}
      <Card className="shadow-xs">
        <CardHeader className="space-y-1.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
