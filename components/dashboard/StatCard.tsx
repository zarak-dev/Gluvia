import * as React from "react";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { SUGAR_LEVEL_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SugarLevel, TrendDirection } from "@/types";

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  level?: SugarLevel;
  trend?: TrendDirection;
  trendPercent?: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  level,
  trend,
  trendPercent,
  icon: Icon,
  iconBg,
  iconColor,
  className,
}: StatCardProps): React.ReactElement {
  // Determine squircle container colors if not explicitly passed
  let resolvedBg = iconBg ?? "bg-[#DDF7ED] dark:bg-[#20B486]/20";
  let resolvedColor = iconColor ?? "text-[#20B486]";

  if (!iconBg) {
    if (title.toLowerCase().includes("average")) {
      resolvedBg = "bg-[#E8F3FF] dark:bg-blue-500/20";
      resolvedColor = "text-[#3B82F6] dark:text-blue-400";
    } else if (title.toLowerCase().includes("trend")) {
      resolvedBg = "bg-[#F3E8FF] dark:bg-purple-500/20";
      resolvedColor = "text-[#8B5CF6] dark:text-purple-400";
    } else if (title.toLowerCase().includes("total")) {
      resolvedBg = "bg-[#FEF3C7] dark:bg-amber-500/20";
      resolvedColor = "text-[#F59E0B] dark:text-amber-400";
    }
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border border-[#E8EEF2] dark:border-border bg-white dark:bg-card p-5 shadow-[0_2px_12px_rgba(23,50,77,0.02)] transition-shadow hover:shadow-md flex flex-col justify-between",
        className
      )}
    >
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between space-y-0">
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl shadow-2xs",
              resolvedBg,
              resolvedColor
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-1.5">
        <p className="text-xs sm:text-sm font-medium text-[#718096] dark:text-muted-foreground">
          {title}
        </p>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] dark:text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-xs sm:text-sm font-semibold text-[#718096] dark:text-muted-foreground">
              {unit}
            </span>
          )}
        </div>

        {/* Status Badge / Subtitle row */}
        <div className="pt-1 flex items-center gap-2">
          {level ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                level === "normal" && "bg-[#DDF7ED] dark:bg-[#20B486]/20 text-[#20B486]",
                level === "elevated" && "bg-[#FFF4E5] dark:bg-amber-500/20 text-[#D97706] dark:text-amber-400",
                level === "high" && "bg-[#FEE2E2] dark:bg-rose-500/20 text-[#EF4444] dark:text-rose-400",
                level === "low" && "bg-[#FEF3C7] dark:bg-amber-500/20 text-[#B45309] dark:text-amber-300"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span>{SUGAR_LEVEL_LABELS[level]}</span>
            </span>
          ) : trendPercent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] dark:bg-purple-500/20 text-[#8B5CF6] dark:text-purple-300 px-2.5 py-0.5 text-xs font-semibold">
              <span>{trendPercent}</span>
            </span>
          ) : trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                trend === "up" && "bg-[#FEE2E2] dark:bg-rose-500/20 text-[#EF4444] dark:text-rose-400",
                trend === "down" && "bg-[#DDF7ED] dark:bg-[#20B486]/20 text-[#20B486]",
                trend === "stable" && "bg-[#F3E8FF] dark:bg-purple-500/20 text-[#8B5CF6] dark:text-purple-300"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              {trend === "stable" && <Minus className="h-3 w-3" />}
              <span className="capitalize">{trend}</span>
            </span>
          ) : subtitle ? (
            <span className="text-xs text-[#718096] dark:text-muted-foreground font-normal">
              {subtitle}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
