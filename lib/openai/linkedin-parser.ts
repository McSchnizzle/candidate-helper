/**
 * LinkedIn Profile Parser
 * Uses OpenAI to extract structured data from pasted LinkedIn content
 */

import { OpenAI } from "openai";
import { trackCost, calculateGPTCost } from "@/lib/utils/cost-tracker";
import type { ResumeData } from "@/lib/types/resume-builder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseLinkedInProfile(linkedinText: string): Promise<Partial<ResumeData>> {
  try {
    const systemPrompt = `You are an expert at parsing LinkedIn profiles into structured resume data.

Extract the following information from the provided LinkedIn profile text:
- Basic info: name, location, headline
- Work experience: company, title, dates, descriptions
- Education: degree, institution, field, graduation year
- Skills: technical and soft skills mentioned

CRITICAL RULES:
1. Only extract information that is explicitly present in the text
2. NEVER fabricate or guess information
3. Convert LinkedIn descriptions into professional resume bullets
4. Preserve dates in YYYY-MM format when possible
5. If information is missing, omit that field rather than guessing`;

    const userPrompt = `Parse this LinkedIn profile content into structured resume data:

${linkedinText}

Respond in JSON format matching this structure:
{
  "basic_info": {
    "full_name": "string",
    "location": "string"
  },
  "work_history": [
    {
      "title": "string",
      "company": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM" or null if current,
      "is_current": boolean,
      "raw_description": "string",
      "enhanced_bullets": ["bullet 1", "bullet 2"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "field": "string",
      "graduation_year": "YYYY"
    }
  ],
  "skills": ["skill1", "skill2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more accurate extraction
      max_tokens: 2000,
    });

    const response = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    ) as Partial<ResumeData>;

    // Add IDs to work history and education
    if (response.work_history) {
      response.work_history = response.work_history.map((job) => ({
        ...job,
        id: crypto.randomUUID(),
      }));
    }

    if (response.education) {
      response.education = response.education.map((edu) => ({
        ...edu,
        id: crypto.randomUUID(),
      }));
    }

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
    console.error("LinkedIn parsing error:", error);
    throw new Error("Failed to parse LinkedIn profile. Please try again.");
  }
}
