/**
 * Professional Summary Generation
 * Creates tailored professional summaries based on resume data
 */

import { OpenAI } from "openai";
import { trackCost, calculateGPTCost } from "@/lib/utils/cost-tracker";
import type {
  GenerateSummaryRequest,
  GenerateSummaryResponse,
} from "@/lib/types/resume-builder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(
  request: GenerateSummaryRequest
): Promise<GenerateSummaryResponse> {
  try {
    const { work_history, education, skills } = request;

    // Determine career level
    const yearsExperience = work_history.length * 2; // Rough estimate
    const titles = work_history.map((w) => w.title.toLowerCase()).join(" ");
    let careerLevel = "entry-level";

    if (titles.includes("lead") || titles.includes("principal") || titles.includes("director")) {
      careerLevel = "senior leadership";
    } else if (titles.includes("senior") || yearsExperience >= 7) {
      careerLevel = "senior";
    } else if (yearsExperience >= 3) {
      careerLevel = "mid-level";
    }

    const systemPrompt = `You are an expert resume writer creating professional summaries.

GUIDELINES:
1. Write in active voice and confident tone
2. Highlight key strengths and expertise areas
3. Mention relevant technical skills if applicable
4. Keep it 2-3 sentences long
5. Avoid clichés like "hard worker", "team player", "detail-oriented"
6. Tailor to the candidate's career level: ${careerLevel}
7. Generate 3 distinct variations with different angles

DO NOT fabricate experience, skills, or accomplishments not in the provided data.`;

    const userPrompt = `Create 3 professional summary variations for this candidate:

**Work History:**
${work_history.map((w) => `- ${w.title} at ${w.company} (${w.start_date} - ${w.end_date || "Present"})`).join("\n")}

**Education:**
${education.map((e) => `- ${e.degree} in ${e.field || "N/A"} from ${e.institution}`).join("\n")}

**Skills:**
${skills.join(", ")}

**Career Level:** ${careerLevel}

Generate 3 distinct professional summary options (2-3 sentences each).
Respond in JSON format:
{
  "summaries": ["summary 1", "summary 2", "summary 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 600,
    });

    const response = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    ) as GenerateSummaryResponse;

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
    console.error("Summary generation error:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
}
