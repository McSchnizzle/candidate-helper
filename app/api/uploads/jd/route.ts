import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jdText, source = "pasted" } = await request.json();

    if (!jdText || typeof jdText !== "string") {
      return NextResponse.json(
        { error: "Job description text is required" },
        { status: 400 }
      );
    }

    if (jdText.length < 50) {
      return NextResponse.json(
        { error: "Job description must be at least 50 characters" },
        { status: 400 }
      );
    }

    if (jdText.length > 50000) {
      return NextResponse.json(
        { error: "Job description cannot exceed 50,000 characters" },
        { status: 413 }
      );
    }

    // Return the processed JD
    return NextResponse.json({
      success: true,
      jdText: jdText.trim(),
      source,
      characterCount: jdText.length,
      wordCount: jdText.split(/\s+/).length,
    });
  } catch (error) {
    console.error("JD upload error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to process job description";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
