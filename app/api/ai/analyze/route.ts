import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { callGemini } from "@/lib/gemini";
import { AI_LIMITS } from "@/lib/constants";
import type { SugarReading } from "@/types";

const readingSchema = z.object({
  id: z.string(),
  reading_date: z.string(),
  sugar_mg_dl: z.number(),
  meal_tag: z.enum(["fasting", "before_meal", "after_meal", "bedtime"]),
  food_eaten: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const analyzeRequestSchema = z.object({
  username: z.string().default("Patient"),
  readings: z.array(readingSchema).min(1, "At least one reading is required for clinical analysis"),
});

const ANALYZE_SYSTEM_PROMPT = `You are a clinical diabetes analytics specialist preparing an objective, factual glycemic summary for review between a South Asian patient and their endocrinologist or physician.

GUIDELINES:
- Synthesize blood glucose trends across fasting, post-prandial, and bedtime intervals.
- Recognize South Asian cultural dietary contexts (e.g. roti, daal, rice, curries).
- Be factual, professional, and descriptive.
- Do NOT infer diseases or make clinical diagnoses.
- Do NOT prescribe or modify medication dosages.
- Maximum length: approximately 300 to 400 words.

MANDATORY OUTPUT FORMAT:
You MUST structure your output strictly under these four exact headers in all-caps:
OVERVIEW:
[Summary of date range, number of readings evaluated, average glycemic level, and percentage within target range (70–139 mg/dL)]
PATTERNS:
[Notable glycemic trends, fasting vs post-meal variations, and meal timing correlations]
CONCERNS:
[Specific instances of elevated spikes (>180 mg/dL) or hypoglycemia risk (<70 mg/dL)]
RECOMMENDATIONS:
[Objective talking points and glycemic questions for the patient to discuss with their treating physician]`;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parseResult = analyzeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          message: "Invalid analysis payload",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, readings } = parseResult.data;

    // Build data summary for the model
    const readingsSummary = readings
      .map(
        (r) =>
          `- ${new Date(r.reading_date).toLocaleDateString("en-PK")}: ${r.sugar_mg_dl} mg/dL (${r.meal_tag})${
            r.food_eaten ? ` | Food: ${r.food_eaten}` : ""
          }`
      )
      .join("\n");

    const userPrompt = `Patient Name/Identifier: ${username}
Total Readings Logged: ${readings.length}

Recorded Readings (Chronological/Recent):
${readingsSummary}

Please produce the structured 4-section clinical summary following the mandatory headers: OVERVIEW:, PATTERNS:, CONCERNS:, and RECOMMENDATIONS:.`;

    const summary = await callGemini({
      systemPrompt: ANALYZE_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: AI_LIMITS.ANALYZE_MAX_TOKENS,
    });

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error generating clinical analysis";
    return NextResponse.json(
      { message: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
