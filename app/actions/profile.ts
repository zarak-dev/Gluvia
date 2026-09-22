"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileActionResult {
  success?: boolean;
  error?: string;
  message?: string;
}

/**
 * Updates the user's display username in the public.profiles table.
 */
export async function updateUsernameAction(
  username: string
): Promise<ProfileActionResult> {
  try {
    const trimmed = username.trim();
    if (!trimmed) {
      return { error: "Username cannot be empty." };
    }
    if (trimmed.length < 2 || trimmed.length > 40) {
      return { error: "Username must be between 2 and 40 characters." };
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to update your profile." };
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("id", user.id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true, message: "Username updated successfully!" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update username.";
    return { error: msg };
  }
}

/**
 * Changes the user's password using Supabase Auth.
 */
export async function changePasswordAction(
  newPassword: string,
  confirmPassword: string
): Promise<ProfileActionResult> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }
    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to change your password." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true, message: "Password updated successfully!" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update password.";
    return { error: msg };
  }
}
