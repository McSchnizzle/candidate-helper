/**
 * LinkedIn Import API
 * POST /api/resume-builder/import-linkedin
 */

import { NextRequest, NextResponse } from "next/server";
import { parseLinkedInProfile } from "@/lib/openai/linkedin-parser";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { linkedinText } = await request.json();

    if (!linkedinText || linkedinText.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide LinkedIn profile content (at least 50 characters)" },
        { status: 400 }
      );
    }

    const parsedData = await parseLinkedInProfile(linkedinText);

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error("LinkedIn import API error:", error);
    return NextResponse.json(
      { error: "Failed to import LinkedIn profile" },
      { status: 500 }
    );
  }
}
