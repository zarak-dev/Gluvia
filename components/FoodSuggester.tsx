"use client";

import { useState, useEffect, useCallback } from "react";
import { Apple, Filter, Sparkles, Info } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SUGAR_STATE_LABELS,
  TIME_LABELS,
  PRICE_LABELS,
  TASTE_LABELS,
} from "@/lib/constants";
import type {
  FoodCombination,
  SugarState,
  TimeOfDay,
  PricePref,
  TastePref,
} from "@/types";

// Curated South Asian reference fallback foods if Supabase table is empty
const SAMPLE_SOUTH_ASIAN_FOODS: FoodCombination[] = [
  {
    id: "sample-1",
    sugar_state: "type2",
    time_of_day: "breakfast",
    price_pref: "budget",
    taste_pref: "savory",
    food_item: "1 Bran Roti + Masoor Daal + Cucumber Slices",
    calories: 280,
    protein: 12,
    carbohydrates: 42,
    fat: 6,
    fiber: 9,
    sugar: 3,
  },
  {
    id: "sample-2",
    sugar_state: "type2",
    time_of_day: "lunch",
    price_pref: "moderate",
    taste_pref: "spicy",
    food_item: "Bhindi (Okra) Sabzi + 1 Multigrain Phulka + Fresh Mint Raita",
    calories: 320,
    protein: 11,
    carbohydrates: 44,
    fat: 9,
    fiber: 11,
    sugar: 4,
  },
  {
    id: "sample-3",
    sugar_state: "type2",
    time_of_day: "dinner",
    price_pref: "moderate",
    taste_pref: "savory",
    food_item:
      "Grilled Tikka Chicken Breast + Steamed Saag/Palak + Kachumber Salad",
    calories: 340,
    protein: 36,
    carbohydrates: 12,
    fat: 14,
    fiber: 6,
    sugar: 2,
  },
  {
    id: "sample-4",
    sugar_state: "pre",
    time_of_day: "breakfast",
    price_pref: "budget",
    taste_pref: "mild",
    food_item: "Besan Cheela (Gram Flour Pancake) with Tomato Chutney & Curd",
    calories: 260,
    protein: 14,
    carbohydrates: 32,
    fat: 8,
    fiber: 8,
    sugar: 3,
  },
  {
    id: "sample-5",
    sugar_state: "type1",
    time_of_day: "lunch",
    price_pref: "premium",
    taste_pref: "spicy",
    food_item: "Brown Basmati Rice (1/2 cup) + Chana Masala + Flaxseed Raita",
    calories: 380,
    protein: 15,
    carbohydrates: 52,
    fat: 10,
    fiber: 12,
    sugar: 4,
  },
  {
    id: "sample-6",
    sugar_state: "advanced",
    time_of_day: "dinner",
    price_pref: "budget",
    taste_pref: "mild",
    food_item: "Tori (Ridge Gourd) Curry + 1 Bajra Roti + Lemon Green Salad",
    calories: 250,
    protein: 8,
    carbohydrates: 38,
    fat: 5,
    fiber: 10,
    sugar: 3,
  },
  {
    id: "sample-7",
    sugar_state: "type2",
    time_of_day: "breakfast",
    price_pref: "budget",
    taste_pref: "mild",
    food_item: "2 Boiled Eggs + 1 Slice Whole Grain Toast + Unsweetened Chai",
    calories: 240,
    protein: 16,
    carbohydrates: 18,
    fat: 11,
    fiber: 3,
    sugar: 2,
  },
  {
    id: "sample-8",
    sugar_state: "type2",
    time_of_day: "lunch",
    price_pref: "budget",
    taste_pref: "savory",
    food_item: "Moong Daal Khichdi (Lentil-heavy) + Roasted Jeera Dahi",
    calories: 310,
    protein: 14,
    carbohydrates: 46,
    fat: 7,
    fiber: 8,
    sugar: 3,
  },
];

export function FoodSuggester(): React.ReactElement {
  const [sugarState, setSugarState] = useState<SugarState>("type2");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("lunch");
  const [pricePref, setPricePref] = useState<PricePref>("moderate");
  const [tastePref, setTastePref] = useState<TastePref>("savory");

  const [foods, setFoods] = useState<FoodCombination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from("food_combinations")
        .select("*")
        .eq("sugar_state", sugarState)
        .eq("time_of_day", timeOfDay)
        .eq("price_pref", pricePref)
        .eq("taste_pref", tastePref);

      if (dbError) {
        throw new Error(dbError.message);
      }

      if (data && data.length > 0) {
        setFoods(data as FoodCombination[]);
      } else {
        // Fallback matching in local curated array
        const matched = SAMPLE_SOUTH_ASIAN_FOODS.filter(
          (f) =>
            f.sugar_state === sugarState &&
            f.time_of_day === timeOfDay &&
            f.price_pref === pricePref &&
            f.taste_pref === tastePref
        );

        if (matched.length > 0) {
          setFoods(matched);
        } else {
          // Broad fallback by meal timing
          const timingFallback = SAMPLE_SOUTH_ASIAN_FOODS.filter(
            (f) => f.time_of_day === timeOfDay
          );
          setFoods(timingFallback);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load foods";
      setError(msg);
      // Even if network fails, provide sample matches
      setFoods(
        SAMPLE_SOUTH_ASIAN_FOODS.filter((f) => f.time_of_day === timeOfDay)
      );
    } finally {
      setIsLoading(false);
    }
  }, [sugarState, timeOfDay, pricePref, tastePref]);

  useEffect(() => {
    void fetchFoods();
  }, [fetchFoods]);

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filter South Asian Food Pairings
          </CardTitle>
          <CardDescription>
            Select your diabetic stage, meal timing, budget, and taste
            preference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Sugar State */}
            <div className="space-y-1.5">
              <label
                htmlFor="sugar_state_select"
                className="text-xs font-semibold text-foreground"
              >
                Diabetes Status
              </label>
              <Select
                value={sugarState}
                onValueChange={(val) => setSugarState(val as SugarState)}
              >
                <SelectTrigger id="sugar_state_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SUGAR_STATE_LABELS) as Array<SugarState>).map(
                    (st) => (
                      <SelectItem key={st} value={st}>
                        {SUGAR_STATE_LABELS[st]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Time of Day */}
            <div className="space-y-1.5">
              <label
                htmlFor="time_select"
                className="text-xs font-semibold text-foreground"
              >
                Meal Timing
              </label>
              <Select
                value={timeOfDay}
                onValueChange={(val) => setTimeOfDay(val as TimeOfDay)}
              >
                <SelectTrigger id="time_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIME_LABELS) as Array<TimeOfDay>).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIME_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Preference */}
            <div className="space-y-1.5">
              <label
                htmlFor="price_select"
                className="text-xs font-semibold text-foreground"
              >
                Price Preference
              </label>
              <Select
                value={pricePref}
                onValueChange={(val) => setPricePref(val as PricePref)}
              >
                <SelectTrigger id="price_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRICE_LABELS) as Array<PricePref>).map((pr) => (
                    <SelectItem key={pr} value={pr}>
                      {PRICE_LABELS[pr]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Taste Preference */}
            <div className="space-y-1.5">
              <label
                htmlFor="taste_select"
                className="text-xs font-semibold text-foreground"
              >
                Flavor & Spice
              </label>
              <Select
                value={tastePref}
                onValueChange={(val) => setTastePref(val as TastePref)}
              >
                <SelectTrigger id="taste_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASTE_LABELS) as Array<TastePref>).map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {TASTE_LABELS[tp]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommended Combinations ({foods.length})
        </h2>
        <span className="text-xs text-muted-foreground">
          {TIME_LABELS[timeOfDay]} • {PRICE_LABELS[pricePref]}
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-in fade-in-50 duration-200" aria-busy="true" aria-label="Loading food suggestions">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="shadow-sm flex flex-col justify-between p-5 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-36" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div
                    key={j}
                    className="rounded-md bg-muted/40 p-2 space-y-1 text-center"
                  >
                    <Skeleton className="h-2.5 w-10 mx-auto" />
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3 w-56" />
              </div>
            </Card>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-card">
          <Apple className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <h3 className="font-semibold text-foreground">
            No exact matching combinations
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Try switching price preference or flavor profile to explore
            alternative diabetic-friendly South Asian dishes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {foods.map((food) => (
            <Card
              key={food.id}
              className="shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-snug">
                    {food.food_item}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {food.calories} kcal
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {SUGAR_STATE_LABELS[food.sugar_state]} •{" "}
                  {TIME_LABELS[food.time_of_day]}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md bg-muted/60 p-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Protein
                    </div>
                    <div className="font-semibold text-foreground">
                      {food.protein}g
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/60 p-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Carbs
                    </div>
                    <div className="font-semibold text-foreground">
                      {food.carbohydrates}g
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/60 p-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Fiber
                    </div>
                    <div className="font-semibold text-primary">
                      {food.fiber}g
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/60 p-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Fat
                    </div>
                    <div className="font-semibold text-foreground">
                      {food.fat}g
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/60 p-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Sugar
                    </div>
                    <div className="font-semibold text-sugar-high">
                      {food.sugar}g
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/60 p-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Taste
                    </div>
                    <div className="font-semibold text-foreground capitalize">
                      {food.taste_pref}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    High fiber buffers glucose absorption from roti & daal.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
