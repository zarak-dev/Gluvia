import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export function DashboardSkeleton(): React.ReactElement {
  return (
    <div
      className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Top Action Row Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Hero Welcome Card Skeleton */}
      <div className="rounded-3xl border border-[#E8EEF2] bg-gradient-to-r from-[#EBF8F5] via-[#E4F5FA] to-[#EFF8FD] p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64 sm:w-80 rounded-lg" />
              <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
            </div>
            <Skeleton className="h-8 w-60 rounded-full" />
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Skeleton className="w-full max-w-[340px] sm:max-w-[400px] h-[190px] sm:h-[220px] rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border border-[#E8EEF2] p-5 shadow-xs">
            <CardHeader className="p-0 pb-3">
              <Skeleton className="h-11 w-11 rounded-2xl" />
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Side-by-Side 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Readings Card Skeleton */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E8EEF2] bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E8EEF2]/80">
                  <TableHead className="w-[140px]"><Skeleton className="h-3.5 w-20" /></TableHead>
                  <TableHead className="w-[120px]"><Skeleton className="h-3.5 w-16" /></TableHead>
                  <TableHead className="w-[110px]"><Skeleton className="h-3.5 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-3.5 w-16" /></TableHead>
                  <TableHead className="w-[50px] text-right"><Skeleton className="h-3.5 w-10 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-[#E8EEF2]/60">
                    <TableCell className="py-3">
                      <Skeleton className="h-3.5 w-20 mb-1" />
                      <Skeleton className="h-2.5 w-12" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-3.5 w-16" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-3.5 w-24" />
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Skeleton className="h-6 w-6 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right: Sugar Trend Chart Skeleton */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E8EEF2] bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-[240px] w-full rounded-xl" />
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-[#E8EEF2]/60">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

