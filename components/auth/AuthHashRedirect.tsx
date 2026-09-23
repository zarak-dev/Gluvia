"use client";

import { useEffect } from "react";

/**
 * Safety net: If Supabase Auth or an external provider redirects to the landing page
 * with an auth or recovery hash fragment (e.g. #access_token=...&type=recovery),
 * immediately redirect the browser to /update-password preserving the full hash fragment.
 */
export function AuthHashRedirect(): null {
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;

    const hash = window.location.hash;
    if (
      hash.includes("type=recovery") ||
      (hash.includes("access_token") && (hash.includes("type=recovery") || hash.includes("recovery")))
    ) {
      window.location.replace(`/update-password${hash}`);
    }
  }, []);

  return null;
}
