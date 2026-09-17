import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  Calendar,
  TrendingUp,
  Hash,
  ArrowUpRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/getUser";
import { average, calculateTrend, getSugarLevel } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickAddDialog } from "@/components/dashboard/QuickAddDialog";
import { RecentReadings } from "@/components/dashboard/RecentReadings";
import { Button } from "@/components/ui/button";
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

  // Fetch latest 30 readings for stats and recent list
  const { data: rawReadings } = await supabase
    .from("sugar_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("reading_date", { ascending: false })
    .limit(30);

  const readings: SugarReading[] = (rawReadings ?? []) as SugarReading[];

  // Also query total count of all readings
  const { count: totalCount } = await supabase
    .from("sugar_readings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalReadings = totalCount ?? readings.length;

  // Server-side calculation: Latest reading
  const latestReading = readings[0] ?? null;
  const latestSugar = latestReading ? latestReading.sugar_mg_dl : null;
  const latestLevel =
    latestSugar !== null ? getSugarLevel(latestSugar) : undefined;

  // Server-side calculation: 7-day average
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDayReadings = readings.filter(
    (r) => new Date(r.reading_date) >= sevenDaysAgo
  );
  const average7day =
    sevenDayReadings.length > 0
      ? Math.round(average(sevenDayReadings.map((r) => r.sugar_mg_dl)))
      : null;
  const average7dayLevel =
    average7day !== null ? getSugarLevel(average7day) : undefined;

  // Server-side calculation: Trend direction (from chronological order)
  const chronologicalValues = readings.map((r) => r.sugar_mg_dl).reverse();
  const trend = calculateTrend(chronologicalValues);

  return (
    <div className="space-y-8">
      {/* Header with Greeting & Quick Add */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Welcome back, {typedProfile?.username ?? "Friend"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is your glycemic overview and recent blood sugar readings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/trends">
              <span>View Trends</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <QuickAddDialog />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Latest Reading"
          value={latestSugar !== null ? `${latestSugar}` : "—"}
          subtitle={
            latestReading
              ? `Logged ${new Date(latestReading.reading_date).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}`
              : "No readings yet"
          }
          level={latestLevel}
          icon={Activity}
        />

        <StatCard
          title="7-Day Average"
          value={average7day !== null ? `${average7day}` : "—"}
          subtitle={
            sevenDayReadings.length > 0
              ? `Based on ${sevenDayReadings.length} reading${sevenDayReadings.length === 1 ? "" : "s"}`
              : "Need readings within 7d"
          }
          level={average7dayLevel}
          icon={Calendar}
        />

        <StatCard
          title="Glycemic Trend"
          value={
            trend === "up" ? "Rising" : trend === "down" ? "Falling" : "Stable"
          }
          subtitle="Trajectory over recent logs"
          trend={readings.length >= 2 ? trend : undefined}
          icon={TrendingUp}
        />

        <StatCard
          title="Total Logged"
          value={totalReadings}
          subtitle="All-time blood glucose entries"
          icon={Hash}
        />
      </div>

      {/* Recent Readings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Recent Blood Sugar Logs
            </h2>
            <p className="text-sm text-muted-foreground">
              Your 10 most recent readings with meal timings and context
            </p>
          </div>

          {readings.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/log">Add New Log</Link>
            </Button>
          )}
        </div>

        <RecentReadings initialReadings={readings} />
      </div>
    </div>
  );
}
