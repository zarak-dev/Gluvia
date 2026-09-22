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

      {/* Desktop & Tablet Table (horizontally scrollable on small screens) */}
      <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">Date & Time</TableHead>
              <TableHead className="w-[140px]">Glucose</TableHead>
              <TableHead className="w-[140px]">Meal Tag</TableHead>
              <TableHead>Food Eaten</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.slice(0, 10).map((reading) => {
              const level = getSugarLevel(reading.sugar_mg_dl);
              const formattedDate = formatDate(reading.reading_date);
              const timeString = new Date(
                reading.reading_date
              ).toLocaleTimeString("en-PK", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <div>{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">
                      {timeString}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold">
                        {reading.sugar_mg_dl}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        mg/dL
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                          getSugarBadgeClass(level)
                        )}
                      >
                        {SUGAR_LEVEL_LABELS[level]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                      {MEAL_TAG_LABELS[reading.meal_tag]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground">
                    {reading.food_eaten || "—"}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground">
                    {reading.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setReadingToDelete(reading)}
                      aria-label={`Delete reading from ${formattedDate}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
