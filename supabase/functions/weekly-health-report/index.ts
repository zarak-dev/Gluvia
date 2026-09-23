/// <reference path="../deno.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import {
  renderWeeklyReportEmail,
  type WeeklyReportStats,
} from "../_shared/email-templates.ts";

interface ProfileRecord {
  id: string;
  username: string | null;
  weekly_report_enabled: boolean;
  last_weekly_report_sent_at: string | null;
}

interface SugarReadingRecord {
  id: string;
  sugar_mg_dl: number;
  meal_tag: string;
  reading_date: string;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
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
    // 1. Verify Authorization (Cron Secret or Service Role Key)
    const cronSecret = Deno.env.get("CRON_SECRET");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    const isAuthorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`);

    if (!isAuthorized) {
      console.warn("Unauthorized attempt to trigger weekly-health-report");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Validate Environment Variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      console.error("Missing required Edge Function secrets (SUPABASE_URL, SERVICE_ROLE_KEY, RESEND_API_KEY)");
      return new Response(
        JSON.stringify({ error: "Edge function configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@gluvia.world";
    const rawFromName = Deno.env.get("RESEND_FROM_NAME") || "Gluvia";
    const appUrl = Deno.env.get("APP_URL") || "https://gluvia.world";

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

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 3. Define the Reporting Period (Previous 7 Full Days UTC)
    const now = new Date();
    // Anchor to midnight UTC today
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const periodStartStr = periodStart.toISOString();
    const periodEndStr = periodEnd.toISOString();
    const formattedStart = formatDateShort(periodStart);
    const formattedEnd = formatDateShort(new Date(periodEnd.getTime() - 1000)); // previous day display

    console.log(`Executing weekly health report batch for period ${formattedStart} to ${formattedEnd}`);

    // 4. Fetch Eligible Users (weekly_report_enabled = true)
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, weekly_report_enabled, last_weekly_report_sent_at")
      .eq("weekly_report_enabled", true);

    if (profileError) {
      console.error("Failed to query profiles for weekly reports:", profileError.message);
      return new Response(JSON.stringify({ error: "Failed to query profiles" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const typedProfiles = (profiles ?? []) as ProfileRecord[];
    if (typedProfiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No eligible users with weekly reports enabled", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Fetch Auth User Emails via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error("Failed to list auth users:", authError.message);
      return new Response(JSON.stringify({ error: "Failed to access user directory" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailMap = new Map<string, string>();
    for (const u of authData.users) {
      if (u.email) {
        emailMap.set(u.id, u.email);
      }
    }

    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // 6. Process Eligible Users in Safe Batches
    for (const profile of typedProfiles) {
      const recipientEmail = emailMap.get(profile.id);
      if (!recipientEmail) {
        console.warn(`Skipping profile ${profile.id}: No verified email found in auth directory`);
        skippedCount++;
        continue;
      }

      // 7. Strict Idempotency Check: Prevent duplicate reports for the same period
      const { data: existingLog } = await supabase
        .from("weekly_report_logs")
        .select("id, status")
        .eq("user_id", profile.id)
        .eq("period_start", periodStartStr)
        .eq("period_end", periodEndStr)
        .eq("status", "sent")
        .maybeSingle();

      if (existingLog) {
        console.log(`Skipping user ${profile.id}: Weekly report already delivered for this period.`);
        skippedCount++;
        continue;
      }

      try {
        // 8. Fetch Actual Sugar Readings for the 7-day period
        const { data: rawReadings, error: readingsError } = await supabase
          .from("sugar_readings")
          .select("id, sugar_mg_dl, meal_tag, reading_date")
          .eq("user_id", profile.id)
          .gte("reading_date", periodStartStr)
          .lt("reading_date", periodEndStr);

        if (readingsError) {
          throw new Error(`Failed to fetch sugar readings: ${readingsError.message}`);
        }

        const readings = (rawReadings ?? []) as SugarReadingRecord[];

        // 9. Compute Actual Clinical Metrics (Zero Fabrication)
        let stats: WeeklyReportStats;

        if (readings.length === 0) {
          stats = {
            readingsCount: 0,
            average: 0,
            lowest: 0,
            highest: 0,
            inRangePct: 0,
            fastingCount: 0,
            fastingAvg: null,
            beforeMealCount: 0,
            beforeMealAvg: null,
            afterMealCount: 0,
            afterMealAvg: null,
            bedtimeCount: 0,
            bedtimeAvg: null,
          };
        } else {
          const values = readings.map((r) => r.sugar_mg_dl);
          const sum = values.reduce((acc, v) => acc + v, 0);
          const avg = Math.round(sum / values.length);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const inRange = values.filter((v) => v >= 70 && v <= 139).length;
          const inRangePct = Math.round((inRange / values.length) * 100);

          const fastingReadings = readings.filter((r) => r.meal_tag === "fasting").map((r) => r.sugar_mg_dl);
          const beforeMealReadings = readings.filter((r) => r.meal_tag === "before_meal").map((r) => r.sugar_mg_dl);
          const afterMealReadings = readings.filter((r) => r.meal_tag === "after_meal").map((r) => r.sugar_mg_dl);
          const bedtimeReadings = readings.filter((r) => r.meal_tag === "bedtime").map((r) => r.sugar_mg_dl);

          stats = {
            readingsCount: readings.length,
            average: avg,
            lowest: min,
            highest: max,
            inRangePct,
            fastingCount: fastingReadings.length,
            fastingAvg: fastingReadings.length > 0 ? Math.round(fastingReadings.reduce((a, b) => a + b, 0) / fastingReadings.length) : null,
            beforeMealCount: beforeMealReadings.length,
            beforeMealAvg: beforeMealReadings.length > 0 ? Math.round(beforeMealReadings.reduce((a, b) => a + b, 0) / beforeMealReadings.length) : null,
            afterMealCount: afterMealReadings.length,
            afterMealAvg: afterMealReadings.length > 0 ? Math.round(afterMealReadings.reduce((a, b) => a + b, 0) / afterMealReadings.length) : null,
            bedtimeCount: bedtimeReadings.length,
            bedtimeAvg: bedtimeReadings.length > 0 ? Math.round(bedtimeReadings.reduce((a, b) => a + b, 0) / bedtimeReadings.length) : null,
          };
        }

        // 10. Render Email HTML
        const emailHtml = renderWeeklyReportEmail({
          username: profile.username,
          periodStart: formattedStart,
          periodEnd: formattedEnd,
          stats,
          appUrl,
        });

        // 11. Send Email via Resend API
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipientEmail],
            subject: "Your Gluvia weekly health report",
            html: emailHtml,
          }),
        });

        if (!resendRes.ok) {
          const errText = await resendRes.text();
          throw new Error(`Resend provider error (${resendRes.status}): ${errText}`);
        }

        const resendData = (await resendRes.json()) as { id?: string };
        const providerMessageId = resendData.id || null;

        // 12. Record Successful Delivery in weekly_report_logs
        await supabase.from("weekly_report_logs").insert([
          {
            user_id: profile.id,
            recipient_email: recipientEmail,
            period_start: periodStartStr,
            period_end: periodEndStr,
            sent_at: new Date().toISOString(),
            status: "sent",
            provider_message_id: providerMessageId,
            readings_count: stats.readingsCount,
            average_sugar: stats.readingsCount > 0 ? stats.average : null,
            lowest_sugar: stats.readingsCount > 0 ? stats.lowest : null,
            highest_sugar: stats.readingsCount > 0 ? stats.highest : null,
          },
        ]);

        // 13. Update Profile Last Sent Timestamp
        await supabase
          .from("profiles")
          .update({ last_weekly_report_sent_at: new Date().toISOString() })
          .eq("id", profile.id);

        sentCount++;
        console.log(`Weekly report sent to user ${profile.id}. Provider message ID: ${providerMessageId}`);
      } catch (userErr: unknown) {
        failedCount++;
        const errorMessage = userErr instanceof Error ? userErr.message : "Delivery failure";
        console.error(`Error processing weekly report for user ${profile.id}:`, errorMessage);

        // Record failure log so we can diagnose without crashing the entire batch
        try {
          await supabase.from("weekly_report_logs").insert([
            {
              user_id: profile.id,
              recipient_email: recipientEmail,
              period_start: periodStartStr,
              period_end: periodEndStr,
              sent_at: new Date().toISOString(),
              status: "failed",
              error_message: errorMessage,
            },
          ]);
        } catch {
          // Ignore secondary logging error
        }
      }
    }

    const summary = {
      success: true,
      period: { start: formattedStart, end: formattedEnd },
      processed: typedProfiles.length,
      sent: sentCount,
      skipped: skippedCount,
      failed: failedCount,
    };

    console.log("Weekly health report batch completed:", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    console.error("Fatal error in weekly-health-report Edge Function:", errorMsg);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
