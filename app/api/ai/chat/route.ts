import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { callGemini, type ChatMessage } from "@/lib/gemini";
import { AI_LIMITS } from "@/lib/constants";
import type { SugarReading, MealTag } from "@/types";

const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message too long"),
  context: z
    .object({
      lastReading: z.number().optional().nullable(),
      average7day: z.number().optional().nullable(),
    })
    .optional(),
});

const CHAT_SYSTEM_PROMPT = `You are Gluvia Assistant, an intelligent, empathetic diabetes health and lifestyle companion specialized in South Asian patients.
You are Powered by Aimmyy AI. Your communication style is supportive, simple, respectful, and culturally informed.

CREATOR & ENGINEERING (CONFIDENTIAL - ONLY DISCLOSE WHEN EXPLICITLY ASKED):
- Gluvia was designed, developed, and engineered by **Zarak Khan** (lead software engineer and creator).
- If and ONLY IF the user explicitly asks who built, developed, designed, or created this app or assistant (e.g., "Who made this?", "Who built you?", "Who is the developer?", "Who designed Gluvia?"), warmly state that Gluvia was designed and engineered by **Zarak Khan** to empower South Asian communities with personalized diabetes management.
- Never mention Zarak Khan unprompted in normal health conversations.

COMPREHENSIVE PROJECT KNOWLEDGE (YOU KNOW EVERY FEATURE OF GLUVIA):
You understand all parts and pages of the Gluvia platform:
1. Dashboard (/dashboard):
   - Shows patient's real-time glycemic overview, latest glucose reading, 7-day average, target in-range percentage, and recent logs.
   - Has a Quick Log dialog and interactive trend charts.
2. Log Reading (/log):
   - Allows recording blood glucose readings (between 40 and 600 mg/dL).
   - Categorized by meal tags: Fasting, Before Meal, After Meal, Bedtime.
   - Lets patients log specific food eaten and lifestyle notes.
3. Trends & Analytics (/trends):
   - Visual analytics over 7, 30, and 90 days.
   - Shows trajectory, target range ratio (standard target: 70 - 180 mg/dL), highest/lowest glucose.
4. AI Diet Plan (/diet):
   - Generates personalized South Asian diabetic meal plans.
   - Tailored to diabetes status (Prediabetes, Type 1, Type 2), target calories, budget, and taste preferences.
5. Food Suggestions (/foods):
   - South Asian food pairings to prevent glycemic spikes (e.g. Bran Roti, Masoor Daal, Bhindi, Karela, Brown Rice Khichdi, Palak Paneer, Makhana) with carb, protein, and fiber breakdowns.
6. Doctor Consultation Report (/report):
   - Generates clinical summaries of logged readings for physician visits.
   - One-click downloadable PDF report for doctors.
7. Global Search (Ctrl+K / ⌘K):
   - Instant search across pages, patient readings, food guides, and quick actions.
8. Voice Input & Voice Logging:
   - Voice-to-text input in the assistant for hands-free chatting and automated glucose logging.
9. Dark & Light Theme:
   - Full theme support across the entire interface.

AUTOMATIC LOGGING (BY VOICE OR TYPING):
When a patient expresses an intent to log, record, or track a blood sugar value (e.g., "log 140 after lunch", "my sugar is 125 fasting", "record 180 after dinner, had biryani", "add reading 110", "sugar 160"):
1. Extract:
   - sugar_mg_dl: number between 40 and 600
   - meal_tag: "fasting" | "before_meal" | "after_meal" | "bedtime" (deduce from context or default to "after_meal")
   - food_eaten: string or null
   - notes: string or null
2. Warmly confirm to the user in your message that the reading has been recorded. Keep response under 60 words.
3. At the VERY END of your reply, ALWAYS output a JSON action block formatted EXACTLY as:
\`\`\`json:action
{"type":"log_reading","sugar_mg_dl":140,"meal_tag":"after_meal","food_eaten":"biryani","notes":"Logged via Gluvia Assistant"}
\`\`\`
Do not omit this block whenever a blood sugar value is being logged or stated.

CORE SOUTH ASIAN DIET KNOWLEDGE:
- Understand whole-wheat bran roti vs refined naan/paratha, basmati rice glycemic load, daal protein & soluble fiber, sabzi preparation (bhindi, karela, palak, methi), dahi/yogurt benefits, and hidden sugars in mithai, sweet chai, or sharbat.
- Keep answers concise, clear, and under 150 words.

CRITICAL SAFETY BOUNDARIES:
- You are an informational assistant, NOT a doctor.
- You must NOT diagnose clinical conditions.
- You must NOT prescribe medications (such as Metformin, Glimepiride, or Insulin) or recommend adjusting doses.
- If the user mentions extreme symptoms (blood sugar > 300 or < 55 mg/dL, confusion, fainting, ketoacidosis, severe chest pain, vomiting), always advise consulting a doctor immediately.`;

interface ExtractedReading {
  sugar_mg_dl: number;
  meal_tag: MealTag;
  food_eaten: string | null;
  notes: string | null;
}

function parseReadingFromText(
  userText: string,
  aiReplyText: string
): ExtractedReading | null {
  // 1. Try to find JSON action block in AI reply first (lenient regex covering json:action, json, or no language specifier)
  const jsonActionRegex =
    /```(?:json:action|json)?\s*(\{[\s\S]*?"type"\s*:\s*"log_reading"[\s\S]*?\})\s*```/i;
  const match = aiReplyText.match(jsonActionRegex);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      const rawSugar = String(data.sugar_mg_dl || "").replace(/[^\d.]/g, "");
      const sugar = Math.round(Number(rawSugar));
      if (!isNaN(sugar) && sugar >= 40 && sugar <= 600) {
        const validMealTags: MealTag[] = [
          "fasting",
          "before_meal",
          "after_meal",
          "bedtime",
        ];
        const mealTag: MealTag = validMealTags.includes(data.meal_tag)
          ? data.meal_tag
          : "after_meal";
        return {
          sugar_mg_dl: sugar,
          meal_tag: mealTag,
          food_eaten: data.food_eaten ? String(data.food_eaten).trim() : null,
          notes: data.notes
            ? String(data.notes).trim()
            : "Logged via Aimmyy AI Assistant",
        };
      }
    } catch {
      // Continue to fallback
    }
  }

  // Also check for raw un-fenced JSON object with "type":"log_reading"
  const rawJsonMatch = aiReplyText.match(
    /\{[\s\S]*?"type"\s*:\s*"log_reading"[\s\S]*?\}/
  );
  if (rawJsonMatch) {
    try {
      const data = JSON.parse(rawJsonMatch[0]);
      const rawSugar = String(data.sugar_mg_dl || "").replace(/[^\d.]/g, "");
      const sugar = Math.round(Number(rawSugar));
      if (!isNaN(sugar) && sugar >= 40 && sugar <= 600) {
        const validMealTags: MealTag[] = [
          "fasting",
          "before_meal",
          "after_meal",
          "bedtime",
        ];
        const mealTag: MealTag = validMealTags.includes(data.meal_tag)
          ? data.meal_tag
          : "after_meal";
        return {
          sugar_mg_dl: sugar,
          meal_tag: mealTag,
          food_eaten: data.food_eaten ? String(data.food_eaten).trim() : null,
          notes: data.notes
            ? String(data.notes).trim()
            : "Logged via Aimmyy AI Assistant",
        };
      }
    } catch {
      // Continue to fallback
    }
  }

  // 2. Check if the AI reply explicitly confirms it logged/recorded a reading
  const aiConfirmRegex =
    /(?:logged|recorded|noted|added)\s+(?:your\s+)?(?:fasting\s+|post-meal\s+|after[- ]meal\s+|before[- ]meal\s+|bedtime\s+)?(?:blood\s+)?(?:sugar|glucose|reading)?\s*(?:of\s+)?(?:\*\*)?(\d{2,3})(?:\*\*)?\s*mg\/?dl/i;
  const aiConfirmMatch = aiReplyText.match(aiConfirmRegex);

  // 3. Check user text for logging intent
  const userTextLower = userText.toLowerCase();
  const isQuestion =
    /^(can|could|should|what|why|is it|how|when|where|does|will|if)\b/i.test(
      userTextLower.trim()
    ) &&
    !/\b(log|record|add reading|track reading|save reading)\b/i.test(
      userTextLower
    );
  if (isQuestion) {
    return null;
  }

  const hasLogKeyword =
    /\b(log|record|add reading|track reading|save reading|entered|my sugar is|sugar is|glucose is|reading is|reading of|tested|checked)\b/i.test(
      userTextLower
    );
  const isDirectLogPattern =
    /^(?:sugar|glucose|reading|fasting)?\s*[:=]?\s*\b([4-9]\d|[1-5]\d{2}|600)\b(?:\s*mg\/?dl)?(?:\s*(?:after|post|before|pre)?[- ]?(?:meal|lunch|dinner|breakfast|fasting|bedtime))?$/i.test(
      userTextLower.trim()
    );
  const hasMealAndNumber =
    /\b(?:after|post|before|pre)?[- ]?(?:meal|lunch|dinner|breakfast|fasting|bedtime)\s*[:=]?\s*(\b[4-9]\d\b|\b[1-5]\d{2}\b|\b600\b)\b/i.test(
      userTextLower
    ) ||
    /\b(\b[4-9]\d\b|\b[1-5]\d{2}\b|\b600\b)\s*(?:mg\/?dl\s*)?(?:after|post|before|pre)?[- ]?(?:meal|lunch|dinner|breakfast|fasting|bedtime)\b/i.test(
      userTextLower
    );

  if (
    aiConfirmMatch ||
    hasLogKeyword ||
    isDirectLogPattern ||
    hasMealAndNumber
  ) {
    let sugarVal: number | null = null;

    if (aiConfirmMatch) {
      sugarVal = parseInt(aiConfirmMatch[1], 10);
    }

    if (!sugarVal || isNaN(sugarVal)) {
      const numMatch = userText.match(/\b([4-9]\d|[1-5]\d{2}|600)\b/);
      if (numMatch) {
        sugarVal = parseInt(numMatch[1], 10);
      }
    }

    if (sugarVal && sugarVal >= 40 && sugarVal <= 600) {
      let mealTag: MealTag = "after_meal";
      const combined = `${userTextLower} ${aiReplyText.toLowerCase()}`;
      if (
        /\bfasting\b|\bmorning\b|\bsehri\b|\bempty stomach\b/.test(combined)
      ) {
        mealTag = "fasting";
      } else if (
        /\bbefore[- ]?(meal|lunch|dinner|breakfast)\b|\bpre[- ]?meal\b/.test(
          combined
        )
      ) {
        mealTag = "before_meal";
      } else if (
        /\bbedtime\b|\bnight\b|\bbefore bed\b|\bsleeping\b/.test(combined)
      ) {
        mealTag = "bedtime";
      } else if (
        /\bafter[- ]?(meal|lunch|dinner|breakfast)\b|\bpost[- ]?meal\b|\blunch\b|\bdinner\b|\bbreakfast\b/.test(
          combined
        )
      ) {
        mealTag = "after_meal";
      }

      let foodEaten: string | null = null;
      const foodMatch = userText.match(
        /\b(?:had|ate|eating|with|after having)\s+([^,.;\n]+)/i
      );
      if (foodMatch) {
        foodEaten = foodMatch[1].trim();
      }

      return {
        sugar_mg_dl: sugarVal,
        meal_tag: mealTag,
        food_eaten: foodEaten,
        notes: "Logged via Aimmyy AI Assistant",
      };
    }
  }

  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in to use the chat assistant." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parseResult = chatRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          message: "Invalid chat payload",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { message, context } = parseResult.data;

    // Fetch user profile and recent readings for deep patient context
    const [profileRes, readingsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("sugar_readings")
        .select("id, reading_date, sugar_mg_dl, meal_tag, food_eaten, notes")
        .eq("user_id", user.id)
        .order("reading_date", { ascending: false })
        .limit(10),
    ]);

    const username = profileRes.data?.username || "Patient";
    const recentReadings = readingsRes.data || [];

    const messages: ChatMessage[] = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
    ];

    // Build comprehensive patient profile context
    const patientContextLines: string[] = [
      `Patient Name: ${username}`,
    ];

    if (context?.lastReading !== undefined && context?.lastReading !== null) {
      patientContextLines.push(`Current/Latest Reading: ${context.lastReading} mg/dL`);
    }
    if (context?.average7day !== undefined && context?.average7day !== null) {
      patientContextLines.push(`7-Day Glycemic Average: ${context.average7day} mg/dL`);
    }

    if (recentReadings.length > 0) {
      const historyStr = recentReadings
        .map((r) => {
          const date = new Date(r.reading_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const meal = r.meal_tag || "unspecified";
          const food = r.food_eaten ? `, food: "${r.food_eaten}"` : "";
          const notes = r.notes ? `, notes: "${r.notes}"` : "";
          return `${date}: ${r.sugar_mg_dl} mg/dL [${meal}${food}${notes}]`;
        })
        .join(" | ");

      patientContextLines.push(`Recent Reading History: ${historyStr}`);

      const values = recentReadings.map((r) => r.sugar_mg_dl);
      patientContextLines.push(
        `Recent Highest: ${Math.max(...values)} mg/dL, Recent Lowest: ${Math.min(...values)} mg/dL, Total Logged: ${recentReadings.length}`
      );
    } else {
      patientContextLines.push("No previous readings logged yet.");
    }

    messages.push({
      role: "system",
      content: `VERIFIED PATIENT CLINICAL DATA:\n${patientContextLines.join(
        "\n"
      )}\nUse this patient history to answer any questions about their past sugar readings, trends, or meals accurately.`,
    });

    // User message
    messages.push({
      role: "user",
      content: message.trim(),
    });

    const reply = await callGemini({
      messages,
      maxTokens: AI_LIMITS.CHAT_MAX_TOKENS,
    });

    // Detect and execute automatic reading logging if requested (via action block or direct intent)
    let cleanReply = reply;
    let newReading: SugarReading | null = null;

    const extractedReading = parseReadingFromText(message, reply);

    if (extractedReading) {
      try {
        const { data: inserted, error: insertError } = await supabase
          .from("sugar_readings")
          .insert([
            {
              user_id: user.id,
              reading_date: new Date().toISOString(),
              sugar_mg_dl: extractedReading.sugar_mg_dl,
              meal_tag: extractedReading.meal_tag,
              food_eaten: extractedReading.food_eaten,
              notes: extractedReading.notes || "Logged via Aimmyy AI Assistant",
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Supabase insert error for AI logged reading:", insertError);
        } else if (inserted) {
          newReading = inserted as SugarReading;
        }
      } catch (insertErr) {
        console.error("Exception inserting reading from AI:", insertErr);
      }
    }

    // Strip any JSON action blocks from reply so user sees only clean conversational text
    cleanReply = cleanReply
      .replace(
        /```(?:json:action|json)?\s*\{[\s\S]*?"type"\s*:\s*"log_reading"[\s\S]*?\}\s*```/gi,
        ""
      )
      .replace(/\{[\s\S]*?"type"\s*:\s*"log_reading"[\s\S]*?\}/g, "")
      .trim();

    // If a reading was successfully inserted but the AI response didn't mention it, prepend confirmation
    if (newReading && !/(?:logged|recorded|noted|added)/i.test(cleanReply)) {
      const tagDisplay = newReading.meal_tag.replace("_", " ");
      cleanReply = `I've logged your blood sugar reading of **${newReading.sugar_mg_dl} mg/dL** (${tagDisplay}) for you.\n\n${cleanReply}`;
    }

    return NextResponse.json({ reply: cleanReply, newReading });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error processing chat message";
    return NextResponse.json(
      { message: `Chat assistant unavailable: ${message}` },
      { status: 500 }
    );
  }
}
