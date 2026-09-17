import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/getUser";
import { SugarTrendChart } from "@/components/charts/SugarTrendChart";
import type { SugarReading } from "@/types";

export const metadata: Metadata = {
  title: "Trends — Gluvia",
  description:
    "View glycemic trends, in-range ratios, and glucose trajectory over 7, 30, and 90 days.",
};

export default async function TrendsPage(): Promise<React.ReactElement> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createClient();

  // Fetch readings up to 90 days (limit 150)
  const { data: rawReadings } = await supabase
    .from("sugar_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("reading_date", { ascending: false })
    .limit(150);

  const readings = (rawReadings ?? []) as SugarReading[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2.5 text-foreground">
          <TrendingUp className="h-7 w-7 text-primary" />
          Glycemic Trends & Analysis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your blood sugar patterns over time, monitor percentage in
          target range, and recognize spikes across different meal timings.
        </p>
      </div>

      <SugarTrendChart readings={readings} />
    </div>
  );
}
