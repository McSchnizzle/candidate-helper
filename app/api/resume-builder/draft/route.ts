/**
 * Resume Builder Draft API
 * Handles CRUD operations for resume drafts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { ResumeDraft, UpdateDraftRequest } from "@/lib/types/resume-builder";

export const runtime = "nodejs";

// GET /api/resume-builder/draft - Get current user's draft
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in to save drafts" },
        { status: 401 }
      );
    }

    const { data: draft, error } = await supabase
      .from("resume_drafts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (expected for new users)
      console.error("Error fetching draft:", error);
      return NextResponse.json({ error: "Failed to fetch draft" }, { status: 500 });
    }

    return NextResponse.json({ draft: draft || null });
  } catch (error) {
    console.error("Unexpected error in GET /api/resume-builder/draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/resume-builder/draft - Create or update draft
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in to save drafts" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateDraftRequest;

    // Check if draft exists
    const { data: existingDraft } = await supabase
      .from("resume_drafts")
      .select("id, data")
      .eq("user_id", user.id)
      .single();

    const mergedData = existingDraft
      ? { ...existingDraft.data, ...body.data }
      : body.data;

    if (existingDraft) {
      // Update existing draft
      const { data: draft, error } = await supabase
        .from("resume_drafts")
        .update({
          step_completed: body.step_completed,
          data: mergedData,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating draft:", error);
        return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
      }

      return NextResponse.json({ draft });
    } else {
      // Create new draft
      const { data: draft, error } = await supabase
        .from("resume_drafts")
        .insert({
          user_id: user.id,
          step_completed: body.step_completed,
          data: mergedData,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating draft:", error);
        return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
      }

      return NextResponse.json({ draft }, { status: 201 });
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/resume-builder/draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resume-builder/draft - Delete draft
export async function DELETE() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("resume_drafts")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting draft:", error);
      return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/resume-builder/draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
