import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Title & Description Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 sm:w-80 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-md rounded-md" />
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Profile Overview Card Skeleton */}
        <Card className="border-[#E8EEF2] dark:border-border overflow-hidden shadow-xs">
          <Skeleton className="h-28 w-full rounded-none" />
          <CardContent className="relative px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <Skeleton className="h-20 w-20 rounded-full border-4 border-background" />
                <div className="mb-1 space-y-2">
                  <Skeleton className="h-6 w-44 rounded-md" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-7 w-36 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E8EEF2] dark:border-border">
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-4 w-52 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* 2-Column Form Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card Skeleton */}
          <Card className="border-[#E8EEF2] dark:border-border shadow-xs">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-3.5 w-60 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Change Password Card Skeleton */}
          <Card className="border-[#E8EEF2] dark:border-border shadow-xs">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Report Toggle Card Skeleton */}
        <Card className="border-[#E8EEF2] dark:border-border shadow-xs">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-80 rounded-md" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Session Card Skeleton */}
        <Card className="border-[#E8EEF2] dark:border-border shadow-xs">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
