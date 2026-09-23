import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) ?? "recovery";
  const next = searchParams.get("next") ?? "/update-password";

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1. Handle PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    console.error("Auth callback code exchange error:", error.message);
  }

  // 2. Handle token_hash verification (OTP / recovery flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error) {
      return response;
    }
    console.error("Auth callback token_hash verifyOtp error:", error.message);
  }

  // 3. If verification failed or error was passed from Supabase
  const errorDescription = searchParams.get("error_description");
  const redirectTarget = new URL(`${origin}/update-password`);
  redirectTarget.searchParams.set("error", "invalid_token");
  if (errorDescription) {
    redirectTarget.searchParams.set("error_description", errorDescription);
  }

  return NextResponse.redirect(redirectTarget.toString());
}
