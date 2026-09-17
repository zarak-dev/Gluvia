import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUGAR_THRESHOLDS } from "@/lib/constants";
import type { SugarLevel, TrendDirection } from "@/types";

/**
 * Merge Tailwind classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Categorize a sugar reading (mg/dL) into a SugarLevel.
 * Uses application thresholds — not universal clinical diagnosis.
 */
export function getSugarLevel(mgDl: number): SugarLevel {
  if (mgDl < SUGAR_THRESHOLDS.LOW) return "low";
  if (mgDl <= SUGAR_THRESHOLDS.NORMAL_MAX) return "normal";
  if (mgDl <= SUGAR_THRESHOLDS.ELEVATED_MAX) return "elevated";
  return "high";
}

/**
 * Return a Tailwind text-color class for the given sugar level.
 */
export function getSugarColorClass(level: SugarLevel): string {
  const colorMap: Record<SugarLevel, string> = {
    low: "text-sugar-low",
    normal: "text-sugar-normal",
    elevated: "text-sugar-elevated",
    high: "text-sugar-high",
  };
  return colorMap[level];
}

/**
 * Return Tailwind classes for a sugar-level badge.
 */
export function getSugarBadgeClass(level: SugarLevel): string {
  const badgeMap: Record<SugarLevel, string> = {
    low: "bg-sugar-low/10 text-sugar-low border-sugar-low/20",
    normal: "bg-sugar-normal/10 text-sugar-normal border-sugar-normal/20",
    elevated:
      "bg-sugar-elevated/10 text-sugar-elevated border-sugar-elevated/20",
    high: "bg-sugar-high/10 text-sugar-high border-sugar-high/20",
  };
  return badgeMap[level];
}

/**
 * Calculate trend direction from an array of numeric values (chronological order).
 * Compares the average of the first half to the average of the second half.
 */
export function calculateTrend(values: number[]): TrendDirection {
  if (values.length < 2) return "stable";

  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  const firstAvg = average(firstHalf);
  const secondAvg = average(secondHalf);

  const TREND_THRESHOLD = 5;

  if (secondAvg - firstAvg > TREND_THRESHOLD) return "up";
  if (firstAvg - secondAvg > TREND_THRESHOLD) return "down";
  return "stable";
}

/**
 * Format a date string or Date object into a localized short date.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate the arithmetic mean of a numeric array.
 * Returns 0 for an empty array.
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}
