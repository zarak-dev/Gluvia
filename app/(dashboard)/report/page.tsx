import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/getUser";
import { ReportView } from "@/components/report/ReportView";
import type { SugarReading, UserProfile } from "@/types";

export const metadata: Metadata = {
  title: "Doctor Report — Gluvia",
  description:
    "Generate clinical glycemic summaries and export PDF reports for physician consultations.",
};

export default async function ReportPage(): Promise<React.ReactElement> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .maybeSingle();

  const typedProfile = profile as UserProfile | null;
  const username = typedProfile?.username ?? "Patient";

  // Fetch latest 30 readings
  const { data: rawReadings } = await supabase
    .from("sugar_readings")
    .select("*")
    .eq("user_id", user.id)
    .order("reading_date", { ascending: false })
    .limit(30);

  const readings: SugarReading[] = (rawReadings ?? []) as SugarReading[];

  return <ReportView initialReadings={readings} username={username} />;
}
