import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Cached server-side helper to retrieve the authenticated user.
 * Wrapped in React.cache() to deduplicate auth round-trips within a single request render tree.
 */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});
