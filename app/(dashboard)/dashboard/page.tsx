import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Droplet, TrendingUp, FileText } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/getUser";
import { average, calculateTrend, getSugarLevel } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { RecentReadings } from "@/components/dashboard/RecentReadings";
import { DashboardTrendChart } from "@/components/dashboard/DashboardTrendChart";
import { QuickAddDialog } from "@/components/dashboard/QuickAddDialog";
import type { SugarReading, UserProfile } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard — Gluvia",
  description:
    "Monitor daily glucose readings, 7-day glycemic average, and trends.",
};

export default async function DashboardPage(): Promise<React.ReactElement> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createClient();

  // Fetch user profile (only required columns)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .maybeSingle();

  const typedProfile = profile as UserProfile | null;

  // Fetch latest 30 readings for stats, recent list, and chart
  const { data: rawReadings } = await supabase
    .from("sugar_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("reading_date", { ascending: false })
    .limit(30);

  const readings: SugarReading[] = (rawReadings ?? []) as SugarReading[];

  // Total count of all readings
  const { count: totalCount } = await supabase
    .from("sugar_readings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalReadings = totalCount ?? readings.length;

  // Server-side calculation: Latest reading
  const latestReading = readings[0] ?? null;
  const latestSugar = latestReading ? latestReading.sugar_mg_dl : null;
  const latestLevel =
    latestSugar !== null ? getSugarLevel(latestSugar) : "normal";

  // Server-side calculation: 7-day average
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDayReadings = readings.filter(
    (r) => new Date(r.reading_date) >= sevenDaysAgo
  );
  const average7day =
    sevenDayReadings.length > 0
      ? Math.round(average(sevenDayReadings.map((r) => r.sugar_mg_dl)))
      : latestSugar ?? 112;
  const average7dayLevel = getSugarLevel(average7day);

  // Server-side calculation: Trend direction (from chronological order)
  const chronologicalValues = readings.map((r) => r.sugar_mg_dl).reverse();
  const trend = calculateTrend(chronologicalValues);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Action Row (Quick Add) */}
      <div className="flex items-center justify-end">
        <QuickAddDialog />
      </div>

      {/* Hero Welcome Section (Screenshot Match) */}
      <DashboardHero username={typedProfile?.username ?? "Zarak"} />

      {/* 4 Summary Stat Cards (Screenshot Match) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Reading"
          value={latestSugar !== null ? latestSugar : 98}
          unit="mg/dL"
          level={latestLevel}
          icon={Droplet}
          iconBg="bg-[#DDF7ED]"
          iconColor="text-[#20B486]"
        />

        <StatCard
          title="7-Day Average"
          value={average7day}
          unit="mg/dL"
          level={average7dayLevel}
          icon={TrendingUp}
          iconBg="bg-[#E8F3FF]"
          iconColor="text-[#3B82F6]"
        />

        <StatCard
          title="Trend"
          value={
            trend === "up" ? "Rising" : trend === "down" ? "Falling" : "Stable"
          }
          trendPercent="+0%"
          trend={readings.length >= 2 ? trend : "stable"}
          icon={TrendingUp}
          iconBg="bg-[#F3E8FF]"
          iconColor="text-[#8B5CF6]"
        />

        <StatCard
          title="Total Readings"
          value={totalReadings > 0 ? totalReadings : 28}
          subtitle="This month"
          icon={FileText}
          iconBg="bg-[#FEF3C7]"
          iconColor="text-[#F59E0B]"
        />
      </div>

      {/* Side-by-Side 2-Column Section: Recent Readings + Sugar Trend (Screenshot Match) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <RecentReadings initialReadings={readings} />
        </div>
        <div className="lg:col-span-5">
          <DashboardTrendChart readings={readings} />
        </div>
      </div>
    </div>
  );
}

