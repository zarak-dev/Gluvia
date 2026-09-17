import type { MealTag, SugarLevel } from "@/types";

// ============================================================
// Sugar Thresholds (application categorization, NOT clinical diagnosis)
// ============================================================

export const SUGAR_THRESHOLDS = {
  LOW: 70,
  NORMAL_MAX: 139,
  ELEVATED_MAX: 180,
} as const;

// ============================================================
// Form Validation Limits
// ============================================================

export const FORM_LIMITS = {
  SUGAR_MIN: 40,
  SUGAR_MAX: 600,
  CALORIES_MIN: 500,
  CALORIES_MAX: 5000,
  WEIGHT_MIN: 30,
  WEIGHT_MAX: 300,
  ACTIVITY_MIN: 0,
  ACTIVITY_MAX: 300,
  SLEEP_MIN: 1,
  SLEEP_MAX: 14,
} as const;

// ============================================================
// Trend Periods (days)
// ============================================================

export const TREND_PERIODS = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90,
} as const;

// ============================================================
// AI Limits
// ============================================================

export const AI_LIMITS = {
  DIET_MAX_TOKENS: 500,
  CHAT_MAX_TOKENS: 300,
  ANALYZE_MAX_TOKENS: 800,
} as const;

// ============================================================
// Gemini Model
// ============================================================

export const GEMINI_MODEL = "gemini-2.0-flash" as const;

// ============================================================
// Navigation
// ============================================================

export const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Log Reading", href: "/log" },
  { label: "Trends", href: "/trends" },
  { label: "Diet Plan", href: "/diet" },
  { label: "Food Suggestions", href: "/foods" },
  { label: "Report", href: "/report" },
] as const;

// ============================================================
// Label Maps
// ============================================================

export const SUGAR_LEVEL_LABELS: Record<SugarLevel, string> = {
  low: "Low",
  normal: "Normal",
  elevated: "Elevated",
  high: "High",
} as const;

export const MEAL_TAG_LABELS: Record<MealTag, string> = {
  fasting: "Fasting",
  before_meal: "Before Meal",
  after_meal: "After Meal",
  bedtime: "Bedtime",
} as const;
