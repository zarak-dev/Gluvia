import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DietSkeleton(): React.ReactElement {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in-50 duration-300" aria-busy="true" aria-label="Loading diet planner">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-8 w-72 sm:w-96" />
        </div>
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* Grid: Left Form, Right Generated Result */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Input Parameters Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-4 space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-52" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <Skeleton className="h-10 w-full rounded-md mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Right: Diet Plan Cards */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64" />
            <div className="grid grid-cols-4 gap-2 pt-2">
              <Skeleton className="h-14 rounded-md" />
              <Skeleton className="h-14 rounded-md" />
              <Skeleton className="h-14 rounded-md" />
              <Skeleton className="h-14 rounded-md" />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer Alert Skeleton */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4 flex gap-3">
        <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}
