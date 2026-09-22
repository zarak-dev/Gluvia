import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUGAR_THRESHOLDS, TREND_THRESHOLD_MG_DL } from "@/lib/constants";
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

  if (secondAvg - firstAvg > TREND_THRESHOLD_MG_DL) return "up";
  if (firstAvg - secondAvg > TREND_THRESHOLD_MG_DL) return "down";
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

export interface AISectionMarker<T = unknown> {
  key: string;
  title: string;
  meta?: T;
}

export interface ParsedAISection<T = unknown> {
  title: string;
  content: string;
  meta?: T;
}

/**
 * Robust, defensive parser for structured AI responses containing uppercase headers.
 * Extracts sections delimited by given markers while preserving ordering and handling edge cases.
 */
export function parseAISections<T = unknown>(
  text: string,
  markers: Array<AISectionMarker<T>>,
  fallbackTitle = "Summary"
): Array<ParsedAISection<T>> {
  const sections: Array<ParsedAISection<T>> = [];
  const normalized = text.replace(/\r\n/g, "\n");

  const found: Array<{
    marker: AISectionMarker<T>;
    index: number;
  }> = [];

  for (const m of markers) {
    const idx = normalized.toUpperCase().indexOf(m.key.toUpperCase());
    if (idx !== -1) {
      found.push({ marker: m, index: idx });
    }
  }

  found.sort((a, b) => a.index - b.index);

  if (found.length === 0) {
    return [
      {
        title: fallbackTitle,
        content: text.trim(),
      },
    ];
  }

  for (let i = 0; i < found.length; i++) {
    const cur = found[i];
    const startIndex = cur.index + cur.marker.key.length;
    const endIndex =
      i + 1 < found.length ? found[i + 1].index : normalized.length;
    const content = normalized.slice(startIndex, endIndex).trim();

    if (content) {
      sections.push({
        title: cur.marker.title,
        content,
        meta: cur.marker.meta,
      });
    }
  }

  return sections;
}

/**
 * Return site base URL dynamically for redirects and links.
 * Works in development (localhost) and production (custom domain or Vercel).
 */
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
}
