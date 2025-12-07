/**
 * Summary Generation API
 * POST /api/resume-builder/generate-summary
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/openai/summary-generator";
import type { GenerateSummaryRequest } from "@/lib/types/resume-builder";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateSummaryRequest;

    if (!body.work_history || body.work_history.length === 0) {
      return NextResponse.json(
        { error: "Please provide work history to generate a summary" },
        { status: 400 }
      );
    }

    if (!body.education || body.education.length === 0) {
      return NextResponse.json(
        { error: "Please provide education history to generate a summary" },
        { status: 400 }
      );
    }

    if (!body.skills || body.skills.length === 0) {
      return NextResponse.json(
        { error: "Please provide skills to generate a summary" },
        { status: 400 }
      );
    }

    const result = await generateSummary(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Summary generation API error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
