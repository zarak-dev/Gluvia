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

export function ReportSkeleton(): React.ReactElement {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in-50 duration-300" aria-busy="true" aria-label="Loading doctor report">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-8 w-64 sm:w-80" />
          </div>
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>

      {/* Date Range Meta Banner */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Readings Table Card */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="pb-3 space-y-1">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-3.5 w-72" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[160px]"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="w-[130px]"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="w-[120px]"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-10" />
                      <Skeleton className="h-4 w-14 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
