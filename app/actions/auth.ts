"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction(): Promise<never> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error.message);
  }
  redirect("/login");
}
