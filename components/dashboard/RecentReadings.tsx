"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { MEAL_TAG_LABELS, SUGAR_LEVEL_LABELS } from "@/lib/constants";
import { cn, formatDate, getSugarLevel, getSugarBadgeClass } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SugarReading } from "@/types";

export interface RecentReadingsProps {
  initialReadings: SugarReading[];
}

export function RecentReadings({
  initialReadings,
}: RecentReadingsProps): React.ReactElement {
  const router = useRouter();
  const readings = useAppStore((state) => state.readings);
  const setReadings = useAppStore((state) => state.setReadings);
  const removeReading = useAppStore((state) => state.removeReading);

  useEffect(() => {
    setReadings(initialReadings);
  }, [initialReadings, setReadings]);

  const [readingToDelete, setReadingToDelete] = useState<SugarReading | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!readingToDelete) return;

    const previousReadings = readings;
    setIsDeleting(true);
    setDeleteError(null);

    // Optimistic removal from store
    removeReading(readingToDelete.id);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sugar_readings")
        .delete()
        .eq("id", readingToDelete.id);

      if (error) {
        // Rollback state on error
        setReadings(previousReadings);
        setDeleteError(error.message);
        toast.error("Failed to delete reading: " + error.message);
        return;
      }

      toast.success("Reading deleted successfully");
      setReadingToDelete(null);
      router.refresh();
    } catch (err: unknown) {
      // Rollback state on exception
      setReadings(previousReadings);
      const msg =
        err instanceof Error ? err.message : "Failed to delete reading";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center bg-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No blood sugar readings yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Start logging your blood glucose readings to unlock trend analysis,
          insights, and personalized glycemic metrics.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/log">
            <Plus className="h-4 w-4" />
            Log Your First Reading
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {/* Recent Readings Card (Screenshot Match) */}
      <div className="rounded-2xl border border-[#E8EEF2] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,50,77,0.02)]">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-base sm:text-lg font-bold text-[#17324D]">
            Recent Readings
          </h2>
          <Link
            href="/log"
            className="text-xs font-semibold text-[#20B486] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E8EEF2]/80 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-[#718096] h-9">
                  Date & Time
                </TableHead>
                <TableHead className="text-xs font-medium text-[#718096] h-9">
                  Sugar Level
                </TableHead>
                <TableHead className="text-xs font-medium text-[#718096] h-9">
                  Meal Tag
                </TableHead>
                <TableHead className="text-xs font-medium text-[#718096] h-9">
                  Food
                </TableHead>
                <TableHead className="text-xs font-medium text-[#718096] h-9 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.slice(0, 7).map((reading) => {
                const level = getSugarLevel(reading.sugar_mg_dl);
                const formattedDate = formatDate(reading.reading_date);
                const timeString = new Date(
                  reading.reading_date
                ).toLocaleTimeString("en-PK", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow
                    key={reading.id}
                    className="border-b border-[#E8EEF2]/60 hover:bg-[#F7FBFC]/60 transition-colors"
                  >
                    <TableCell className="py-3 text-xs">
                      <div className="font-semibold text-[#17324D]">
                        {formattedDate}
                      </div>
                      <div className="text-[11px] text-[#718096]">
                        {timeString}
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            level === "normal" && "bg-[#20B486]",
                            level === "elevated" && "bg-[#F59E0B]",
                            level === "high" && "bg-[#EF4444]",
                            level === "low" && "bg-[#F97316]"
                          )}
                        />
                        <span className="text-xs font-semibold text-[#17324D]">
                          {reading.sugar_mg_dl} mg/dL
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
                          reading.meal_tag === "fasting" &&
                            "bg-[#F3E8FF] text-[#7C3AED]",
                          reading.meal_tag === "before_meal" &&
                            "bg-[#FFF4E5] text-[#D97706]",
                          reading.meal_tag === "after_meal" &&
                            "bg-[#E8F3FF] text-[#2563EB]",
                          reading.meal_tag === "bedtime" &&
                            "bg-[#F1F5F9] text-[#475569]"
                        )}
                      >
                        {MEAL_TAG_LABELS[reading.meal_tag]}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-xs text-[#5A6A80] max-w-[150px] truncate">
                      {reading.food_eaten || "—"}
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#718096] hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => setReadingToDelete(reading)}
                        aria-label={`Delete reading from ${formattedDate}`}
                        title="Delete reading"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={readingToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setReadingToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Glucose Reading</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the reading of{" "}
              <strong>{readingToDelete?.sugar_mg_dl} mg/dL</strong> logged on{" "}
              {readingToDelete ? formatDate(readingToDelete.reading_date) : ""}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setReadingToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              aria-busy={isDeleting}
              onClick={handleDeleteConfirm}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
