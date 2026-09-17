import * as React from "react";
import { Sunrise, Sun, Moon, Coffee, Flame, Clock } from "lucide-react";

import { formatDate, getSugarBadgeClass, cn } from "@/lib/utils";
import { SUGAR_LEVEL_LABELS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DietPlan } from "@/types";

import { parseAISections } from "@/lib/utils";

export interface DietPlanCardProps {
  plan: DietPlan;
  className?: string;
}

interface ParsedMeal {
  title: string;
  content: string;
  icon: React.ComponentType<{ className?: string }>;
}

function parseDietSections(text: string): ParsedMeal[] {
  const parsed = parseAISections<React.ComponentType<{ className?: string }>>(
    text,
    [
      { key: "BREAKFAST:", title: "Breakfast", meta: Sunrise },
      { key: "LUNCH:", title: "Lunch", meta: Sun },
      { key: "DINNER:", title: "Dinner", meta: Moon },
      { key: "SNACKS:", title: "Snacks & Refreshment", meta: Coffee },
    ],
    "Daily Meal Plan"
  );

  return parsed.map((item) => ({
    title: item.title,
    content: item.content,
    icon: item.meta ?? Sun,
  }));
}

export function DietPlanCard({
  plan,
  className,
}: DietPlanCardProps): React.ReactElement {
  const meals = React.useMemo(
    () => parseDietSections(plan.plan_text),
    [plan.plan_text]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Plan Header Card */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">
                Personalized South Asian Plan
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  getSugarBadgeClass(plan.sugar_level)
                )}
              >
                {SUGAR_LEVEL_LABELS[plan.sugar_level]} Sugar
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-primary" />
                <span>{plan.calories} kcal Target</span>
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(plan.created_at)}
              </span>
            </div>
          </div>
          <CardDescription className="text-xs">
            Portions and ingredients tailored for glycemic stabilization
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Grid of Meal Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {meals.map((meal) => {
          const Icon = meal.icon;
          return (
            <Card key={meal.title} className="shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">{meal.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-line pt-1">
                {meal.content}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
