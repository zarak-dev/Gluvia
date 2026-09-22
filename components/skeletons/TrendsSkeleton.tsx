import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TrendsSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300" aria-busy="true" aria-label="Loading trends">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-8 w-64 sm:w-80" />
        </div>
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* 4 Metric Highlights */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </Card>
        ))}
      </div>

      {/* Main Chart Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-9 w-48 rounded-lg" />
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex flex-col justify-between p-4 bg-muted/20 rounded-lg border border-border/40">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-end justify-between gap-2 h-44 pt-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full rounded-t-sm"
                  style={{ height: `${20 + ((i * 17) % 70)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer Alert Skeleton */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4 flex gap-3">
        <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}
