/**
 * Content Enhancement API
 * POST /api/resume-builder/enhance
 */

import { NextRequest, NextResponse } from "next/server";
import { enhanceContent } from "@/lib/openai/resume-enhancer";
import type { EnhanceContentRequest } from "@/lib/types/resume-builder";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EnhanceContentRequest;

    if (!body.job_description || body.job_description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a job description (at least 10 characters)" },
        { status: 400 }
      );
    }

    const result = await enhanceContent(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Enhancement API error:", error);
    return NextResponse.json(
      { error: "Failed to enhance content" },
      { status: 500 }
    );
  }
}
