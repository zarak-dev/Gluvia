import * as React from "react";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

import { cn, getSugarColorClass, getSugarBadgeClass } from "@/lib/utils";
import { SUGAR_LEVEL_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SugarLevel, TrendDirection } from "@/types";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  level?: SugarLevel;
  trend?: TrendDirection;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  level,
  trend,
  icon: Icon,
  className,
}: StatCardProps): React.ReactElement {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-3xl font-bold tracking-tight",
              level ? getSugarColorClass(level) : "text-foreground"
            )}
          >
            {value}
          </span>
          {level && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                getSugarBadgeClass(level)
              )}
            >
              {SUGAR_LEVEL_LABELS[level]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                trend === "up" && "text-sugar-high",
                trend === "down" && "text-sugar-low",
                trend === "stable" && "text-muted-foreground"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
              {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
              {trend === "stable" && <Minus className="h-3.5 w-3.5" />}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}
