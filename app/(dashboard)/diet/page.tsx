"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Utensils,
  Loader2,
  AlertCircle,
  ShieldCheck,
  History,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { FORM_LIMITS, SUGAR_LEVEL_LABELS } from "@/lib/constants";
import { DietPlanCard } from "@/components/DietPlanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { DietPlan, SugarLevel } from "@/types";

const dietFormSchema = z.object({
  daily_calories: z.coerce
    .number({ invalid_type_error: "Please enter a valid number" })
    .min(
      FORM_LIMITS.CALORIES_MIN,
      `Calories must be at least ${FORM_LIMITS.CALORIES_MIN} kcal`
    )
    .max(
      FORM_LIMITS.CALORIES_MAX,
      `Calories cannot exceed ${FORM_LIMITS.CALORIES_MAX} kcal`
    ),
  current_sugar_level: z.enum(["low", "normal", "elevated", "high"] as const, {
    required_error: "Please select your current sugar status",
  }),
  weight_kg: z.coerce
    .number({ invalid_type_error: "Please enter a valid weight" })
    .min(
      FORM_LIMITS.WEIGHT_MIN,
      `Weight must be at least ${FORM_LIMITS.WEIGHT_MIN} kg`
    )
    .max(
      FORM_LIMITS.WEIGHT_MAX,
      `Weight cannot exceed ${FORM_LIMITS.WEIGHT_MAX} kg`
    ),
  activity_minutes: z.coerce
    .number({ invalid_type_error: "Please enter a valid number" })
    .min(
      FORM_LIMITS.ACTIVITY_MIN,
      `Activity cannot be negative`
    )
    .max(
      FORM_LIMITS.ACTIVITY_MAX,
      `Activity cannot exceed ${FORM_LIMITS.ACTIVITY_MAX} min`
    ),
});

type DietFormValues = z.infer<typeof dietFormSchema>;

export default function DietPage(): React.ReactElement {
  const [currentPlan, setCurrentPlan] = useState<DietPlan | null>(null);
  const [pastPlans, setPastPlans] = useState<DietPlan[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DietFormValues>({
    resolver: zodResolver(dietFormSchema),
    defaultValues: {
      daily_calories: 1800,
      current_sugar_level: "normal",
      weight_kg: 70,
      activity_minutes: 30,
    },
  });

  const loadPastPlans = useCallback(async (): Promise<void> => {
    setIsLoadingPast(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("diet_plans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data) {
          setPastPlans(data as DietPlan[]);
          if (!currentPlan && data.length > 0) {
            setCurrentPlan(data[0] as DietPlan);
          }
        }
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingPast(false);
    }
  }, [currentPlan]);

  useEffect(() => {
    void loadPastPlans();
  }, [loadPastPlans]);

  const onSubmit = async (values: DietFormValues): Promise<void> => {
    setServerError(null);

    try {
      const response = await fetch("/api/ai/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: values.daily_calories,
          sugarLevel: values.current_sugar_level,
          weight: values.weight_kg,
          activityMinutes: values.activity_minutes,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errObj = data as { message?: string };
        throw new Error(errObj.message || "Failed to generate diet plan");
      }

      const resObj = data as { plan: DietPlan };
      setCurrentPlan(resObj.plan);
      setPastPlans((prev) => [resObj.plan, ...prev]);
      toast.success("South Asian diet plan generated successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error generating diet plan";
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2.5 text-foreground">
          <Utensils className="h-7 w-7 text-primary" />
          AI South Asian Diet Planner
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate culturally tailored, nutrient-balanced daily meal plans with
          familiar Pakistani foods to keep your glycemic spikes under control.
        </p>
      </div>

      {/* Grid: Left Form, Right Generated Result */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Input Parameters Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Plan Parameters</CardTitle>
              <CardDescription>
                Customize your daily energy target and physical context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {serverError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                {/* Daily Calories */}
                <div className="space-y-2">
                  <Label htmlFor="daily_calories">
                    Daily Calorie Target (kcal){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="daily_calories"
                    type="number"
                    step="50"
                    min={FORM_LIMITS.CALORIES_MIN}
                    max={FORM_LIMITS.CALORIES_MAX}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.daily_calories}
                    {...register("daily_calories")}
                  />
                  {errors.daily_calories && (
                    <p className="text-xs text-destructive">
                      {errors.daily_calories.message}
                    </p>
                  )}
                </div>

                {/* Current Sugar Status */}
                <div className="space-y-2">
                  <Label htmlFor="current_sugar_level">
                    Current Glucose Status{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="current_sugar_level"
                    control={control}
                    render={({ field }) => (
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="current_sugar_level">
                          <SelectValue placeholder="Select sugar status" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.keys(SUGAR_LEVEL_LABELS) as Array<SugarLevel>
                          ).map((lvl) => (
                            <SelectItem key={lvl} value={lvl}>
                              {SUGAR_LEVEL_LABELS[lvl]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.current_sugar_level && (
                    <p className="text-xs text-destructive">
                      {errors.current_sugar_level.message}
                    </p>
                  )}
                </div>

                {/* Body Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">
                    Body Weight (kg) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.5"
                    min={FORM_LIMITS.WEIGHT_MIN}
                    max={FORM_LIMITS.WEIGHT_MAX}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.weight_kg}
                    {...register("weight_kg")}
                  />
                  {errors.weight_kg && (
                    <p className="text-xs text-destructive">
                      {errors.weight_kg.message}
                    </p>
                  )}
                </div>

                {/* Activity Minutes */}
                <div className="space-y-2">
                  <Label htmlFor="activity_minutes">
                    Daily Physical Activity (minutes){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="activity_minutes"
                    type="number"
                    step="5"
                    min={FORM_LIMITS.ACTIVITY_MIN}
                    max={FORM_LIMITS.ACTIVITY_MAX}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.activity_minutes}
                    {...register("activity_minutes")}
                  />
                  {errors.activity_minutes && (
                    <p className="text-xs text-destructive">
                      {errors.activity_minutes.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Plan with Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate AI Diet Plan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Past Plans Quick Switch */}
          {pastPlans.length > 1 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Recent Saved Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pastPlans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrentPlan(p)}
                    className={`w-full text-left p-2.5 rounded-md border text-xs transition-colors flex items-center justify-between ${
                      currentPlan?.id === p.id
                        ? "border-primary bg-primary/10 font-semibold"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <span>
                      {p.calories} kcal ({SUGAR_LEVEL_LABELS[p.sugar_level]})
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Display Area: Loading Skeleton or DietPlanCard */}
        <div className="lg:col-span-7">
          {isSubmitting ? (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
              </div>
            </div>
          ) : currentPlan ? (
            <DietPlanCard plan={currentPlan} />
          ) : (
            <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-card">
              <Utensils className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-foreground">
                No Diet Plan Active
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Fill in your calorie target and body weight on the left to generate
                a culturally tailored South Asian diabetes diet plan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Medical Safety Disclaimer */}
      <Alert className="bg-muted/40 border-border/70 text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-foreground" />
        <AlertTitle className="text-xs font-semibold text-foreground">
          Medical Nutrition Disclaimer
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed mt-1">
          AI-generated meal plans are general dietary guidance aligned with South
          Asian food staples and do not constitute clinical nutritional therapy or
          prescriptions. Do not adjust your insulin units or oral hypoglycemic
          medication without consulting your personal physician or certified
          diabetes educator.
        </AlertDescription>
      </Alert>
    </div>
  );
}
