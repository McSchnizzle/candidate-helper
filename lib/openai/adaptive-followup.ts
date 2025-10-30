/**
 * Adaptive Follow-up Question Generation
 * Analyzes answers to detect missing STAR elements and generates follow-up questions
 */

import OpenAI from "openai";
import { trackCost } from "@/lib/utils/cost-tracker";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface STARAnalysis {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  missingElements: string[];
  confidence: number;
}

interface FollowUpRequest {
  originalQuestion: string;
  answerText: string;
  resumeContext?: string;
  jobDescriptionContext?: string;
}

interface FollowUpResult {
  shouldFollowUp: boolean;
  followUpQuestion?: string;
  analysis: STARAnalysis;
}

/**
 * Analyze if answer contains all STAR elements
 */
async function analyzeSTARElements(question: string, answerText: string): Promise<STARAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert behavioral interview coach. Analyze the user's answer to determine if it contains the STAR elements (Situation, Task, Action, Result).

Return a JSON object with:
- hasSituation: boolean - does it describe the situation/context?
- hasTask: boolean - does it describe the task/challenge?
- hasAction: boolean - does it describe specific actions taken?
- hasResult: boolean - does it describe measurable results?
- missingElements: array of strings - which STAR elements are missing
- confidence: number 0-100 - confidence level in your assessment`,
        },
        {
          role: "user",
          content: `Question: "${question}"

Answer: "${answerText}"

Analyze this answer for STAR elements.`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");

    const result = JSON.parse(content);

    // Track API cost: 1K input tokens at $0.01, 1K output tokens at $0.03
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const estimatedCost = (inputTokens * 0.01 + outputTokens * 0.03) / 1000;

    await trackCost({
      model: "gpt-4o",
      tokensUsed: inputTokens + outputTokens,
      estimatedCostUsd: estimatedCost,
    });

    return {
      hasSituation: result.hasSituation || false,
      hasTask: result.hasTask || false,
      hasAction: result.hasAction || false,
      hasResult: result.hasResult || false,
      missingElements: result.missingElements || [],
      confidence: result.confidence || 0,
    };
  } catch (error) {
    console.error("[STAR Analysis Error]", error);
    // If analysis fails, don't generate follow-up (fail gracefully)
    return {
      hasSituation: true,
      hasTask: true,
      hasAction: true,
      hasResult: true,
      missingElements: [],
      confidence: 0,
    };
  }
}

/**
 * Generate a follow-up question targeting missing STAR elements
 */
async function generateFollowUpQuestion(
  originalQuestion: string,
  answerText: string,
  missingElements: string[],
  context?: { resume?: string; jobDescription?: string }
): Promise<string | null> {
  try {
    if (missingElements.length === 0) {
      return null; // No follow-up needed
    }

    const contextPrompt =
      context?.resume || context?.jobDescription
        ? `\n\nContext:\n${context.resume ? `Resume: ${context.resume}` : ""}\n${context.jobDescription ? `Job Description: ${context.jobDescription}` : ""}`
        : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert behavioral interview coach. Generate a concise, supportive follow-up question that helps the candidate elaborate on missing STAR elements.

The follow-up should:
- Be warm and encouraging ("Tell me more about...", "Can you walk me through...", "What was the impact of...")
- Focus on ONE missing element only
- Be specific to their answer (reference details they mentioned)
- Be 1-2 sentences max

Return ONLY the follow-up question, no additional text.`,
        },
        {
          role: "user",
          content: `Original Question: "${originalQuestion}"

Candidate's Answer: "${answerText}"

Missing Elements: ${missingElements.join(", ")}

Priority: Focus on the FIRST missing element from the list.${contextPrompt}

Generate a warm, specific follow-up question.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const followUpQuestion = response.choices[0].message.content?.trim();
    if (!followUpQuestion) return null;

    // Track API cost
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const estimatedCost = (inputTokens * 0.01 + outputTokens * 0.03) / 1000;

    await trackCost({
      model: "gpt-4o",
      tokensUsed: inputTokens + outputTokens,
      estimatedCostUsd: estimatedCost,
    });

    return followUpQuestion;
  } catch (error) {
    console.error("[Follow-up Generation Error]", error);
    return null;
  }
}

/**
 * Main function: Determine if follow-up is needed and generate it
 */
export async function generateAdaptiveFollowUp(request: FollowUpRequest): Promise<FollowUpResult> {
  try {
    // Analyze for missing STAR elements
    const analysis = await analyzeSTARElements(request.originalQuestion, request.answerText);

    // If all STAR elements present or low confidence, no follow-up needed
    if (analysis.missingElements.length === 0 || analysis.confidence < 50) {
      return {
        shouldFollowUp: false,
        analysis,
      };
    }

    // Generate follow-up question
    const followUpQuestion = await generateFollowUpQuestion(
      request.originalQuestion,
      request.answerText,
      analysis.missingElements,
      {
        resume: request.resumeContext,
        jobDescription: request.jobDescriptionContext,
      }
    );

    return {
      shouldFollowUp: !!followUpQuestion,
      followUpQuestion: followUpQuestion || undefined,
      analysis,
    };
  } catch (error) {
    console.error("[Adaptive Follow-up Error]", error);
    // Fail gracefully - return no follow-up
    return {
      shouldFollowUp: false,
      analysis: {
        hasSituation: true,
        hasTask: true,
        hasAction: true,
        hasResult: true,
        missingElements: [],
        confidence: 0,
      },
    };
  }
}

/**
 * Validate follow-up is appropriate (not on every answer)
 * Only 1 follow-up per question maximum
 */
export function shouldAllowFollowUp(followUpUsed: boolean, lowAnxietyEnabled: boolean): boolean {
  // Don't allow follow-ups in Low-Anxiety Mode
  if (lowAnxietyEnabled) {
    return false;
  }

  // Only one follow-up per question
  if (followUpUsed) {
    return false;
  }

  return true;
}
