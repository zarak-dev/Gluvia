import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/getUser";
import { createClient } from "@/lib/supabase/server";
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView";
import type { UserProfile } from "@/types";

export const metadata: Metadata = {
  title: "User Profile - Gluvia",
  description:
    "Manage your Gluvia account profile, username, and security credentials.",
};

export default async function ProfilePage(): Promise<React.ReactElement> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const typedProfile: UserProfile | null = profile
    ? {
        id: profile.id,
        username: profile.username,
        created_at: profile.created_at,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          User Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your profile information, manage security credentials, and review account details.
        </p>
      </div>

      <ProfileSettingsView user={typedProfile} email={user.email ?? null} />
    </div>
  );
}
