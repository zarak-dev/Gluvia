import "server-only";

import { GEMINI_MODEL } from "@/lib/constants";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

interface GeminiRequestParams {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
}

interface GeminiChoiceMessage {
  role: string;
  content: string;
}

interface GeminiChoice {
  message: GeminiChoiceMessage;
}

interface GeminiApiResponse {
  choices: GeminiChoice[];
}

function isGeminiApiResponse(data: unknown): data is GeminiApiResponse {
  if (typeof data !== "object" || data === null) return false;

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.choices) || obj.choices.length === 0) return false;

  const firstChoice = obj.choices[0] as Record<string, unknown>;
  if (typeof firstChoice !== "object" || firstChoice === null) return false;

  const message = firstChoice.message as Record<string, unknown>;
  if (typeof message !== "object" || message === null) return false;

  return typeof message.content === "string";
}

/**
 * Call Gemini via the OpenAI-compatible REST endpoint.
 * Server-only — never import this module from client code.
 */
export async function callGemini({
  systemPrompt,
  userPrompt,
  maxTokens,
}: GeminiRequestParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Set it in your environment variables."
    );
  }

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini API request failed (${response.status}): ${errorText}`
    );
  }

  const data: unknown = await response.json();

  if (!isGeminiApiResponse(data)) {
    throw new Error(
      "Gemini API returned an unexpected response shape. Expected choices[0].message.content."
    );
  }

  return data.choices[0].message.content;
}
