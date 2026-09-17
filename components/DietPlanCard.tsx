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
  const sections: ParsedMeal[] = [];
  const normalized = text.replace(/\r\n/g, "\n");

  const markers: Array<{
    key: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: "BREAKFAST:", title: "Breakfast", icon: Sunrise },
    { key: "LUNCH:", title: "Lunch", icon: Sun },
    { key: "DINNER:", title: "Dinner", icon: Moon },
    { key: "SNACKS:", title: "Snacks & Refreshment", icon: Coffee },
  ];

  const foundIndices: Array<{
    index: number;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    keyLength: number;
  }> = [];

  for (const marker of markers) {
    const idx = normalized.toUpperCase().indexOf(marker.key);
    if (idx !== -1) {
      foundIndices.push({
        index: idx,
        title: marker.title,
        icon: marker.icon,
        keyLength: marker.key.length,
      });
    }
  }

  // Sort by appearance in text
  foundIndices.sort((a, b) => a.index - b.index);

  if (foundIndices.length === 0) {
    // Defensive fallback: entire text in one card
    return [
      {
        title: "Daily Meal Plan",
        content: text.trim(),
        icon: Sun,
      },
    ];
  }

  for (let i = 0; i < foundIndices.length; i++) {
    const current = foundIndices[i];
    const startIndex = current.index + current.keyLength;
    const endIndex =
      i + 1 < foundIndices.length
        ? foundIndices[i + 1].index
        : normalized.length;

    const content = normalized.slice(startIndex, endIndex).trim();
    if (content) {
      sections.push({
        title: current.title,
        content,
        icon: current.icon,
      });
    }
  }

  return sections;
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
