/// <reference path="../deno.d.ts" />
// Follow Deno and Supabase Edge Function standards
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { renderPasswordResetEmail } from "../_shared/email-templates.ts";

interface SupabaseAuthHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      username?: string;
    };
  };
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type: string;
    site_url?: string;
    token_new?: string;
  };
}

serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Optional: verify hook secret if configured
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    if (hookSecret) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || authHeader !== `Bearer ${hookSecret}`) {
        console.warn("Unauthorized attempt to invoke auth-email-hook");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const payload = (await req.json()) as SupabaseAuthHookPayload;
    const { user, email_data } = payload;

    // IMPORTANT: Gluvia intentionally disables email verification on signup.
    // Resend is used ONLY for password resets and weekly reports.
    if (email_data.email_action_type !== "recovery") {
      console.log(
        `Skipping email delivery for action "${email_data.email_action_type}". Gluvia only sends recovery emails.`
      );
      return new Response(JSON.stringify({ message: "Action ignored by design" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY in Edge Function secrets");
      return new Response(JSON.stringify({ error: "Email service misconfigured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@gluvia.world";
    const rawFromName = Deno.env.get("RESEND_FROM_NAME") || "Gluvia";
    const appUrl = Deno.env.get("APP_URL") || "https://gluvia.world";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";

    // Cleanly normalize the "from" address to prevent nested "Name <Name <email>>" format
    let fromAddress = "";
    const angleBracketMatch = rawFromEmail.match(/^(.*?)\s*<([^>]+)>\s*$/);
    if (angleBracketMatch) {
      const parsedName = angleBracketMatch[1].trim() || rawFromName;
      const parsedEmail = angleBracketMatch[2].trim();
      fromAddress = `${parsedName} <${parsedEmail}>`;
    } else if (rawFromEmail.includes("@")) {
      fromAddress = `${rawFromName} <${rawFromEmail.trim()}>`;
    } else {
      fromAddress = `${rawFromName} <noreply@gluvia.world>`;
    }

    // Build the secure Supabase recovery verification URL
    let resetUrl = "";
    if (email_data.token_hash && supabaseUrl) {
      const redirectTo = email_data.redirect_to || `${appUrl}/auth/callback?next=/update-password`;
      resetUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=recovery&redirect_to=${encodeURIComponent(
        redirectTo
      )}`;
    } else if (email_data.redirect_to) {
      resetUrl = email_data.redirect_to;
    } else {
      resetUrl = `${appUrl}/update-password`;
    }

    const username = user.user_metadata?.username || null;
    const emailHtml = renderPasswordResetEmail({
      resetUrl,
      username,
      appUrl,
    });

    // Dispatch email through Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [user.email],
        subject: "Reset your Gluvia password",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error(
        "Resend API error sending password reset:",
        resendResponse.status,
        errText
      );
      return new Response(
        JSON.stringify({
          error: "Failed to dispatch email via Resend",
          details: errText,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const resendData = (await resendResponse.json()) as { id?: string };
    console.log(
      `Password reset email dispatched successfully via Resend. Message ID: ${resendData.id || "unknown"}`
    );

    // Return 200 OK to Supabase Auth Hook
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Auth email hook unhandled exception:", errorMsg);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
