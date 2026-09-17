import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/getUser";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AIChatWidget } from "@/components/AIChatWidget";
import type { UserProfile } from "@/types";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createClient();

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .maybeSingle();

  // Recovery fallback (H-6): if trigger did not populate profile, insert safe fallback
  if (!profile) {
    const { data: recoveredProfile } = await supabase
      .from("profiles")
      .insert({ id: user.id, username: null })
      .select("id, username")
      .maybeSingle();
    if (recoveredProfile) {
      profile = recoveredProfile;
    }
  }

  const typedProfile: UserProfile | null = profile
    ? {
        id: profile.id,
        username: profile.username,
        created_at: new Date().toISOString(),
      }
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Persistent Sidebar */}
      <Sidebar user={typedProfile} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <TopBar user={typedProfile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating AI Glycemic Assistant */}
      <AIChatWidget />
    </div>
  );
}
