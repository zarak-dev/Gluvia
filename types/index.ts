// ============================================================
// Domain Type Aliases
// ============================================================

export type MealTag = "fasting" | "before_meal" | "after_meal" | "bedtime";

export type SugarState = "pre" | "type1" | "type2" | "advanced";

export type TimeOfDay = "breakfast" | "lunch" | "dinner";

export type PricePref = "budget" | "moderate" | "premium";

export type TastePref = "sweet" | "savory" | "spicy" | "mild";

export type SugarLevel = "low" | "normal" | "elevated" | "high";

export type TrendDirection = "up" | "down" | "stable";

// ============================================================
// Domain Interfaces
// ============================================================

export interface UserProfile {
  id: string;
  username: string | null;
  created_at: string;
}

export interface SugarReading {
  id: string;
  user_id: string;
  reading_date: string;
  sugar_mg_dl: number;
  meal_tag: MealTag;
  food_eaten: string | null;
  notes: string | null;
  created_at: string;
}

export interface DietPlan {
  id: string;
  user_id: string;
  calories: number;
  sugar_level: SugarLevel;
  plan_text: string;
  created_at: string;
}

export interface FoodCombination {
  id: string;
  sugar_state: SugarState;
  time_of_day: TimeOfDay;
  price_pref: PricePref;
  taste_pref: TastePref;
  food_item: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  latestReading: number | null;
  averageReading: number | null;
  totalReadings: number;
  trend: TrendDirection;
}

export interface AIResponse {
  content: string;
  model: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
