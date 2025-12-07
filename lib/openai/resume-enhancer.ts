/**
 * Resume Content Enhancement
 * Uses OpenAI to help users improve their resume bullet points
 */

import { OpenAI } from "openai";
import { trackCost, calculateGPTCost } from "@/lib/utils/cost-tracker";
import type { EnhanceContentRequest, EnhanceContentResponse } from "@/lib/types/resume-builder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function enhanceContent(
  request: EnhanceContentRequest
): Promise<EnhanceContentResponse> {
  try {
    const { job_description, context } = request;

    const systemPrompt = `You are a professional resume coach helping users create strong, quantified resume bullets.

CRITICAL RULES:
1. NEVER fabricate numbers, metrics, or accomplishments
2. If the user's description lacks quantifiable details, ask 1-2 clarifying questions
3. Use action verbs (achieved, led, developed, managed, created, etc.)
4. Follow STAR framework when possible (Situation, Task, Action, Result)
5. Keep bullets concise (1-2 lines each)
6. Be encouraging and supportive in tone

If the description is vague or lacks metrics, respond with needs_clarification: true and provide specific questions to ask.
If the description has enough detail, provide 2-3 enhanced versions.`;

    const userPrompt = `Help improve this job responsibility description:

"${job_description}"

${context?.company ? `Company: ${context.company}` : ""}
${context?.title ? `Role: ${context.title}` : ""}

Analyze this description and either:
1. If it lacks specifics (no metrics, vague responsibilities), ask 1-2 clarifying questions
2. If it has enough detail, provide 2-3 improved bullet point versions

Respond in JSON format:
{
  "needs_clarification": boolean,
  "questions": ["question 1", "question 2"] (if clarification needed),
  "suggestions": ["bullet 1", "bullet 2", "bullet 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    ) as EnhanceContentResponse;

    // Track cost
    if (completion.usage) {
      const cost = calculateGPTCost("gpt-4o", {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
      });

      await trackCost({
        model: "gpt-4o",
        tokensUsed: completion.usage.total_tokens,
        estimatedCostUsd: cost,
      });
    }

    return response;
  } catch (error) {
    console.error("Resume enhancement error:", error);
    throw new Error("Failed to enhance content. Please try again.");
  }
}
