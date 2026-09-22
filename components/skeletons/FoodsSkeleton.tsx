import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FoodsSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-300" aria-busy="true" aria-label="Loading food suggestions">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-8 w-72 sm:w-80" />
        </div>
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* Filter Card */}
      <Card className="shadow-xs">
        <CardHeader className="pb-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-sm" />
            <Skeleton className="h-5 w-56" />
          </div>
          <Skeleton className="h-3.5 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-5 w-52" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>

      {/* 4 Food Combination Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-xs flex flex-col justify-between p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-36" />
            </div>

            {/* 6 Macro Boxes */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="rounded-md bg-muted/40 p-2 space-y-1 text-center">
                  <Skeleton className="h-2.5 w-10 mx-auto" />
                  <Skeleton className="h-4 w-8 mx-auto" />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3 w-56" />
            </div>
          </Card>
        ))}
      </div>

      {/* Disclaimer Alert Skeleton */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4 flex gap-3">
        <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}
