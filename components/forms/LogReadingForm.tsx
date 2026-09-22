"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  FORM_LIMITS,
  MEAL_TAG_LABELS,
  SUGAR_LEVEL_LABELS,
} from "@/lib/constants";
import { getSugarBadgeClass, getSugarLevel, cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MealTag, SugarReading } from "@/types";

const logReadingSchema = z.object({
  reading_date: z.string().min(1, "Date and time are required"),
  sugar_mg_dl: z.coerce
    .number({ invalid_type_error: "Please enter a valid number" })
    .min(
      FORM_LIMITS.SUGAR_MIN,
      `Reading must be at least ${FORM_LIMITS.SUGAR_MIN} mg/dL`
    )
    .max(
      FORM_LIMITS.SUGAR_MAX,
      `Reading cannot exceed ${FORM_LIMITS.SUGAR_MAX} mg/dL`
    ),
  meal_tag: z.enum(
    ["fasting", "before_meal", "after_meal", "bedtime"] as const,
    {
      required_error: "Please select a meal tag",
    }
  ),
  food_eaten: z
    .string()
    .max(255, "Food description cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

type LogReadingFormValues = z.infer<typeof logReadingSchema>;

function getNowDatetimeLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export interface LogReadingFormProps {
  userId?: string;
  compact?: boolean;
  onSuccess?: (reading: SugarReading) => void;
  onCancel?: () => void;
}

export function LogReadingForm({
  userId,
  compact = false,
  onSuccess,
  onCancel,
}: LogReadingFormProps): React.ReactElement {
  const router = useRouter();
  const addReading = useAppStore((state) => state.addReading);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogReadingFormValues>({
    resolver: zodResolver(logReadingSchema),
    defaultValues: {
      reading_date: getNowDatetimeLocal(),
      sugar_mg_dl: "" as unknown as number,
      meal_tag: "fasting",
      food_eaten: "",
      notes: "",
    },
  });

  const watchedSugar = watch("sugar_mg_dl");
  const sugarNumber = Number(watchedSugar);
  const hasValidNumber =
    !isNaN(sugarNumber) &&
    sugarNumber >= FORM_LIMITS.SUGAR_MIN &&
    sugarNumber <= FORM_LIMITS.SUGAR_MAX;
  const currentLevel = hasValidNumber ? getSugarLevel(sugarNumber) : null;

  const onSubmit = async (values: LogReadingFormValues): Promise<void> => {
    setServerError(null);
    setIsSuccess(false);

    try {
      const supabase = createClient();
      let activeUserId = userId;

      if (!activeUserId) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        activeUserId = session?.user?.id;
      }

      if (!activeUserId) {
        setServerError("You must be signed in to log a reading.");
        return;
      }

      const newReadingPayload = {
        user_id: activeUserId,
        reading_date: new Date(values.reading_date).toISOString(),
        sugar_mg_dl: Math.round(values.sugar_mg_dl),
        meal_tag: values.meal_tag,
        food_eaten: values.food_eaten?.trim() || null,
        notes: values.notes?.trim() || null,
      };

      const { data, error } = await supabase
        .from("sugar_readings")
        .insert([newReadingPayload])
        .select()
        .single();

      if (error) {
        setServerError(error.message);
        return;
      }

      const inserted = data as SugarReading;
      addReading(inserted);
      setIsSuccess(true);
      toast.success(
        `Reading logged: ${inserted.sugar_mg_dl} mg/dL (${MEAL_TAG_LABELS[inserted.meal_tag]})`
      );

      reset({
        reading_date: getNowDatetimeLocal(),
        sugar_mg_dl: "" as unknown as number,
        meal_tag: "fasting",
        food_eaten: "",
        notes: "",
      });

      if (onSuccess) {
        onSuccess(inserted);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to record reading";
      setServerError(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
      aria-busy={isSubmitting}
    >
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {isSuccess && !onSuccess && (
        <Alert className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription>
            Glucose reading successfully recorded and saved to your history!
          </AlertDescription>
        </Alert>
      )}

      {/* Glucose Reading & Live Categorization Badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="sugar_mg_dl">
            Blood Glucose (mg/dL) <span className="text-destructive">*</span>
          </Label>
          {currentLevel && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                getSugarBadgeClass(currentLevel)
              )}
            >
              {SUGAR_LEVEL_LABELS[currentLevel]}
            </span>
          )}
        </div>
        <Input
          id="sugar_mg_dl"
          type="number"
          step="1"
          min={FORM_LIMITS.SUGAR_MIN}
          max={FORM_LIMITS.SUGAR_MAX}
          placeholder="e.g. 110"
          disabled={isSubmitting}
          aria-invalid={!!errors.sugar_mg_dl}
          aria-describedby={
            errors.sugar_mg_dl ? "sugar_mg_dl_error" : undefined
          }
          {...register("sugar_mg_dl")}
        />
        {errors.sugar_mg_dl && (
          <p id="sugar_mg_dl_error" className="text-xs text-destructive">
            {errors.sugar_mg_dl.message}
          </p>
        )}
      </div>

      {/* Date & Time */}
      <div className="space-y-2">
        <Label htmlFor="reading_date">
          Date & Time <span className="text-destructive">*</span>
        </Label>
        <Input
          id="reading_date"
          type="datetime-local"
          disabled={isSubmitting}
          aria-invalid={!!errors.reading_date}
          aria-describedby={
            errors.reading_date ? "reading_date_error" : undefined
          }
          {...register("reading_date")}
        />
        {errors.reading_date && (
          <p id="reading_date_error" className="text-xs text-destructive">
            {errors.reading_date.message}
          </p>
        )}
      </div>

      {/* Meal Tag */}
      <div className="space-y-2">
        <Label htmlFor="meal_tag">
          Meal Timing Tag <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="meal_tag"
          control={control}
          render={({ field }) => (
            <Select
              disabled={isSubmitting}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger id="meal_tag">
                <SelectValue placeholder="Select meal tag" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(MEAL_TAG_LABELS) as Array<MealTag>).map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {MEAL_TAG_LABELS[tag]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.meal_tag && (
          <p className="text-xs text-destructive">{errors.meal_tag.message}</p>
        )}
      </div>

      {/* Food Eaten (South Asian context) */}
      <div className="space-y-2">
        <Label htmlFor="food_eaten">
          Food Eaten{" "}
          <span className="text-xs text-muted-foreground font-normal">
            (Optional)
          </span>
        </Label>
        <Input
          id="food_eaten"
          type="text"
          placeholder="e.g. 1 Whole wheat Roti, Daal, Salad"
          disabled={isSubmitting}
          aria-invalid={!!errors.food_eaten}
          aria-describedby={errors.food_eaten ? "food_eaten_error" : undefined}
          {...register("food_eaten")}
        />
        {errors.food_eaten && (
          <p id="food_eaten_error" className="text-xs text-destructive">
            {errors.food_eaten.message}
          </p>
        )}
      </div>

      {/* Notes */}
      {!compact && (
        <div className="space-y-2">
          <Label htmlFor="notes">
            Notes / Symptoms{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (Optional)
            </span>
          </Label>
          <Textarea
            id="notes"
            placeholder="e.g. 30-min brisk walk after dinner, felt slightly lightheaded"
            rows={3}
            disabled={isSubmitting}
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? "notes_error" : undefined}
            {...register("notes")}
          />
          {errors.notes && (
            <p id="notes_error" className="text-xs text-destructive">
              {errors.notes.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Reading"
          )}
        </Button>
      </div>
    </form>
  );
}
