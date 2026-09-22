"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { formatDate, getSugarLevel, getSugarBadgeClass, cn } from "@/lib/utils";
import { SUGAR_LEVEL_LABELS, MEAL_TAG_LABELS } from "@/lib/constants";
import type { SugarReading } from "@/types";

export interface DashboardTrendChartProps {
  readings: SugarReading[];
}

interface ChartPoint {
  id: string;
  displayDate: string;
  fullDate: string;
  time: string;
  sugar: number;
  mealTag: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartPoint;
    value: number;
  }>;
}

function CustomTooltip({
  active,
  payload,
}: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const level = getSugarLevel(data.sugar);

  return (
    <div className="rounded-xl border border-[#E8EEF2] bg-white p-3 shadow-md text-xs space-y-1">
      <div className="font-semibold text-sm flex items-center justify-between gap-3 text-[#17324D]">
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
      <div className="text-[#718096]">
        <div>
          {data.fullDate} at {data.time}
        </div>
        <div className="font-medium text-[#17324D] mt-0.5">
          {data.mealTag}
        </div>
      </div>
    </div>
  );
}

export function DashboardTrendChart({
  readings,
}: DashboardTrendChartProps): React.ReactElement {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter for last 7 days readings
  const chartData: ChartPoint[] = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7 = readings.filter(
      (r) => new Date(r.reading_date).getTime() >= sevenDaysAgo
    );

    // If we have readings within 7 days, format them chronologically
    if (last7.length > 0) {
      return [...last7].reverse().map((r) => {
        const d = new Date(r.reading_date);
        return {
          id: r.id,
          displayDate: d.toLocaleDateString("en-US", {
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
        };
      });
    }

    // If no recent readings, take the latest up to 7 readings chronologically
    return [...readings.slice(0, 7)].reverse().map((r) => {
      const d = new Date(r.reading_date);
      return {
        id: r.id,
        displayDate: d.toLocaleDateString("en-US", {
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
      };
    });
  }, [readings]);

  return (
    <div className="rounded-2xl border border-[#E8EEF2] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,50,77,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base sm:text-lg font-bold text-[#17324D]">
          Sugar Trend (Last 7 Days)
        </h2>
        <Link
          href="/trends"
          className="text-xs font-semibold text-[#20B486] hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Chart Canvas */}
      <div className="h-[260px] w-full pt-2">
        {!isMounted ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#20B486] border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[#E8EEF2] p-6 text-center text-[#718096]">
            <p className="text-xs font-medium">No readings for the past 7 days</p>
            <p className="text-[11px] mt-1 text-[#8898AA]">
              Log readings to view your glycemic curve
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 10, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#20B486" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#20B486" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F0F4F8"
              />

              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={false}
                className="text-[11px] font-medium fill-[#718096]"
                dy={6}
              />

              <YAxis
                domain={[50, 250]}
                ticks={[50, 100, 150, 200, 250]}
                tickLine={false}
                axisLine={false}
                className="text-[11px] font-medium fill-[#718096]"
                width={45}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="sugar"
                stroke="#20B486"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendGradient)"
                dot={{
                  r: 4,
                  fill: "#20B486",
                  strokeWidth: 2,
                  stroke: "#FFFFFF",
                }}
                activeDot={{
                  r: 6,
                  fill: "#20B486",
                  stroke: "#FFFFFF",
                  strokeWidth: 2.5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend at Bottom (Screenshot Match) */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-[#E8EEF2]/60 text-xs text-[#718096]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#20B486]" />
          <span>Your readings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-xs bg-[#DDF7ED]" />
          <span>Target range</span>
        </div>
      </div>
    </div>
  );
}
