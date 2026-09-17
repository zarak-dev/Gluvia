"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { AlertCircle, TrendingUp, Award, ArrowUp, ArrowDown } from "lucide-react";

import {
  SUGAR_THRESHOLDS,
  TREND_PERIODS,
  MEAL_TAG_LABELS,
  SUGAR_LEVEL_LABELS,
} from "@/lib/constants";
import {
  average,
  formatDate,
  getSugarLevel,
  getSugarBadgeClass,
  cn,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SugarReading } from "@/types";

export interface SugarTrendChartProps {
  readings: SugarReading[];
}

interface ChartDataPoint {
  id: string;
  displayDate: string;
  fullDate: string;
  time: string;
  sugar: number;
  mealTag: string;
  rawReading: SugarReading;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    value: number;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const level = getSugarLevel(data.sugar);

  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-popover-foreground text-xs space-y-1.5">
      <div className="font-semibold text-sm flex items-center justify-between gap-3">
        <span>{data.sugar} mg/dL</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            getSugarBadgeClass(level)
          )}
        >
          {SUGAR_LEVEL_LABELS[level]}
        </span>
      </div>
      <div className="text-muted-foreground">
        <div>{data.fullDate} at {data.time}</div>
        <div className="mt-0.5 font-medium text-foreground">
          Timing: {data.mealTag}
        </div>
        {data.rawReading.food_eaten && (
          <div className="mt-0.5 italic max-w-[200px] truncate">
            Food: {data.rawReading.food_eaten}
          </div>
        )}
      </div>
    </div>
  );
}

export function SugarTrendChart({
  readings,
}: SugarTrendChartProps): React.ReactElement {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const daysCount = useMemo(() => {
    switch (selectedPeriod) {
      case "30":
        return TREND_PERIODS.MONTH;
      case "90":
        return TREND_PERIODS.QUARTER;
      case "7":
      default:
        return TREND_PERIODS.WEEK;
    }
  }, [selectedPeriod]);

  const filteredReadings = useMemo(() => {
    const cutoffTime = Date.now() - daysCount * 24 * 60 * 60 * 1000;
    return readings.filter(
      (r) => new Date(r.reading_date).getTime() >= cutoffTime
    );
  }, [readings, daysCount]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    return [...filteredReadings]
      .reverse()
      .map((r) => {
        const d = new Date(r.reading_date);
        return {
          id: r.id,
          displayDate: d.toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
          }),
          fullDate: formatDate(r.reading_date),
          time: d.toLocaleTimeString("en-PK", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sugar: r.sugar_mg_dl,
          mealTag: MEAL_TAG_LABELS[r.meal_tag],
          rawReading: r,
        };
      });
  }, [filteredReadings]);

  const metrics = useMemo(() => {
    if (filteredReadings.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        inRangePercentage: 0,
        total: 0,
      };
    }

    const values = filteredReadings.map((r) => r.sugar_mg_dl);
    const avg = Math.round(average(values));
    const max = Math.max(...values);
    const min = Math.min(...values);

    const inRangeCount = values.filter(
      (v) => v >= SUGAR_THRESHOLDS.LOW && v <= SUGAR_THRESHOLDS.NORMAL_MAX
    ).length;

    const inRangePct = Math.round((inRangeCount / values.length) * 100);

    return {
      average: avg,
      highest: max,
      lowest: min,
      inRangePercentage: inRangePct,
      total: values.length,
    };
  }, [filteredReadings]);

  return (
    <div className="space-y-6">
      {/* Metric Highlights */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Period Average</span>
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div className="text-2xl font-bold">
            {metrics.total > 0 ? `${metrics.average}` : "—"}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              mg/dL
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Target &lt; {SUGAR_THRESHOLDS.NORMAL_MAX} mg/dL
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>In-Range Ratio</span>
            <Award className="h-3.5 w-3.5" />
          </div>
          <div className="text-2xl font-bold">
            {metrics.total > 0 ? `${metrics.inRangePercentage}%` : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {SUGAR_THRESHOLDS.LOW} - {SUGAR_THRESHOLDS.NORMAL_MAX} mg/dL range
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Highest Reading</span>
            <ArrowUp className="h-3.5 w-3.5 text-sugar-high" />
          </div>
          <div className="text-2xl font-bold text-sugar-high">
            {metrics.total > 0 ? `${metrics.highest}` : "—"}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              mg/dL
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Peak in selected period</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Lowest Reading</span>
            <ArrowDown className="h-3.5 w-3.5 text-sugar-low" />
          </div>
          <div className="text-2xl font-bold text-sugar-low">
            {metrics.total > 0 ? `${metrics.lowest}` : "—"}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              mg/dL
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Lowest in selected period</p>
        </Card>
      </div>

      {/* Main Chart Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg">Blood Glucose Trajectory</CardTitle>
            <CardDescription>
              Temporal trend line with clinical threshold reference markers
            </CardDescription>
          </div>

          <Tabs
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-3 h-9">
              <TabsTrigger value="7" className="text-xs px-3">
                7 Days
              </TabsTrigger>
              <TabsTrigger value="30" className="text-xs px-3">
                30 Days
              </TabsTrigger>
              <TabsTrigger value="90" className="text-xs px-3">
                90 Days
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              <p className="text-sm font-medium">
                No readings recorded within the past {daysCount} days.
              </p>
              <p className="mt-1 text-xs">
                Log readings on the &ldquo;Log Reading&rdquo; page to populate this chart.
              </p>
            </div>
          ) : !isMounted ? (
            <div className="flex h-72 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                    dy={8}
                  />
                  <YAxis
                    domain={[40, "auto"]}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={SUGAR_THRESHOLDS.NORMAL_MAX}
                    stroke="hsl(var(--sugar-normal))"
                    strokeDasharray="4 4"
                    label={{
                      value: "Normal Max (139)",
                      position: "top",
                      fill: "hsl(var(--sugar-normal))",
                      fontSize: 10,
                    }}
                  />
                  <ReferenceLine
                    y={SUGAR_THRESHOLDS.LOW}
                    stroke="hsl(var(--sugar-low))"
                    strokeDasharray="4 4"
                    label={{
                      value: "Low (70)",
                      position: "bottom",
                      fill: "hsl(var(--sugar-low))",
                      fontSize: 10,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sugar"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{
                      r: 3.5,
                      fill: "hsl(var(--primary))",
                      strokeWidth: 1,
                      stroke: "hsl(var(--background))",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "hsl(var(--primary))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mandatory Medical Disclaimer Alert */}
      <Alert className="bg-muted/40 border-border/70 text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-foreground" />
        <AlertTitle className="text-xs font-semibold text-foreground">
          Glycemic Threshold Context
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed mt-1">
          The reference thresholds displayed (Low: &lt;{SUGAR_THRESHOLDS.LOW} mg/dL,
          Target Normal: &le;{SUGAR_THRESHOLDS.NORMAL_MAX} mg/dL, Elevated: &le;{SUGAR_THRESHOLDS.ELEVATED_MAX} mg/dL)
          represent general application categorization and do not constitute a universal
          clinical or medical diagnosis. Target glucose levels vary individually based on
          age, diabetes type, and prescribed treatment regimen. Always consult your personal
          physician or endocrinologist for your individualized glycemic targets.
        </AlertDescription>
      </Alert>
    </div>
  );
}
