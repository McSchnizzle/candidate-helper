import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/sessions/[id]
 * Retrieve session details
 *
 * Returns:
 * - id: UUID
 * - mode: "audio" | "text"
 * - low_anxiety_enabled: boolean
 * - question_count: number
 * - user_id: UUID | null
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Get current user (may be null for guests)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, mode, low_anxiety_enabled, question_count, user_id")
      .eq("id", params.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check authorization (user owns session OR it's a guest session)
    if (session.user_id && session.user_id !== user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Return session details
    return NextResponse.json({
      id: session.id,
      mode: session.mode,
      low_anxiety_enabled: session.low_anxiety_enabled,
      question_count: session.question_count,
      user_id: session.user_id,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/sessions/[id]:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
