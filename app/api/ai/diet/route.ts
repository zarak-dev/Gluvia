import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import { AI_LIMITS, FORM_LIMITS } from "@/lib/constants";
import type { DietPlan } from "@/types";

const dietRequestSchema = z.object({
  calories: z
    .number()
    .min(
      FORM_LIMITS.CALORIES_MIN,
      `Minimum calories: ${FORM_LIMITS.CALORIES_MIN}`
    )
    .max(
      FORM_LIMITS.CALORIES_MAX,
      `Maximum calories: ${FORM_LIMITS.CALORIES_MAX}`
    ),
  sugarLevel: z.enum(["low", "normal", "elevated", "high"]),
  weight: z
    .number()
    .min(FORM_LIMITS.WEIGHT_MIN, `Minimum weight: ${FORM_LIMITS.WEIGHT_MIN} kg`)
    .max(
      FORM_LIMITS.WEIGHT_MAX,
      `Maximum weight: ${FORM_LIMITS.WEIGHT_MAX} kg`
    ),
  activityMinutes: z
    .number()
    .min(
      FORM_LIMITS.ACTIVITY_MIN,
      `Minimum activity: ${FORM_LIMITS.ACTIVITY_MIN} min`
    )
    .max(
      FORM_LIMITS.ACTIVITY_MAX,
      `Maximum activity: ${FORM_LIMITS.ACTIVITY_MAX} min`
    ),
});

const DIET_SYSTEM_PROMPT = `You are an expert South Asian clinical nutritionist and diabetes lifestyle advisor.
Create a structured 1-day meal plan tailored to the user's daily calorie target, current blood glucose categorization, body weight, and physical activity.

STRICT FOOD REQUIREMENTS:
- Utilize traditional South Asian and Pakistani foods: whole-wheat roti, brown or basmati chawal (measured portions), daal (lentils), sabzi (vegetables like bhindi, tori, karela, gobhi), dahi/yogurt, homemade thin lassi (unsweetened), lean chicken, saag/palak, chana (chickpeas), and low-glycemic local fruits (guava, apple, berries, jamun).
- Avoid Western or exotic foods unless standard in South Asian kitchens.
- Keep total response concise (approximately 200 to 250 words maximum).

REQUIRED FORMAT:
You MUST format your response strictly using these four exact section headers in all-caps:
BREAKFAST:
[Items, realistic portion sizes, e.g. 1 small whole-wheat roti with 1 egg and cup of dahi]
LUNCH:
[Items, portion sizes, e.g. 1 cup cooked daal with green salad and cucumber raita]
DINNER:
[Items, portion sizes, e.g. 1 small multigrain roti with grilled chicken and sabzi]
SNACKS:
[Items, portion sizes, e.g. a handful of roasted chana or unsalted almonds with green tea]

SAFETY BOUNDARY:
- Do NOT diagnose any medical condition.
- Do NOT prescribe or adjust insulin, metformin, or any medication dosage.
- Do NOT claim to replace a physician or endocrinologist.
- This meal plan is an informational lifestyle guide only.`;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in to generate a diet plan." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parseResult = dietRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request parameters",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { calories, sugarLevel, weight, activityMinutes } = parseResult.data;

    const userPrompt = `Generate a 1-day South Asian diabetic meal plan with:
- Daily Calorie Target: ${calories} kcal
- Current Blood Sugar Status: ${sugarLevel} (app-categorized)
- Weight: ${weight} kg
- Daily Physical Activity: ${activityMinutes} minutes

Follow the exact section headers (BREAKFAST:, LUNCH:, DINNER:, SNACKS:) and include practical portion sizes.`;

    const planText = await callGemini({
      systemPrompt: DIET_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: AI_LIMITS.DIET_MAX_TOKENS,
    });

    const { data: insertedPlan, error: insertError } = await supabase
      .from("diet_plans")
      .insert([
        {
          user_id: user.id,
          calories: Math.round(calories),
          sugar_level: sugarLevel,
          plan_text: planText,
        },
      ])
      .select()
      .single();

    if (insertError) {
      // Fallback: if database insertion fails, return generated plan with temporary id
      const fallbackPlan: DietPlan = {
        id: "temp-" + Date.now(),
        user_id: user.id,
        calories: Math.round(calories),
        sugar_level: sugarLevel,
        plan_text: planText,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ plan: fallbackPlan });
    }

    return NextResponse.json({ plan: insertedPlan as DietPlan });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Internal error generating diet plan";
    return NextResponse.json(
      { message: `Failed to generate diet plan: ${message}` },
      { status: 500 }
    );
  }
}
