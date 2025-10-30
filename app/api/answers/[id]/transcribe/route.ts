/**
 * POST /api/answers/[id]/transcribe
 * Transcribe audio blob using OpenAI Whisper API
 * Updates answer with transcript text
 */

import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, validateAudioBlob } from "@/lib/openai/stt";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const answerId = params.id;

    // Get the answer to verify ownership
    const { data: answer, error: answerError } = await supabase
      .from("answers")
      .select("id, session_id, question_id")
      .eq("id", answerId)
      .single();

    if (answerError || !answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    // Verify user owns the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, user_id")
      .eq("id", answer.session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const partialStr = formData.get("partial") as string;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert file to blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });

    // Validate audio
    const validation = validateAudioBlob(audioBlob);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || "Invalid audio" }, { status: 400 });
    }

    // Transcribe
    const result = await transcribeAudio(audioBlob, partialStr === "true");

    // Update answer with transcript
    const { data: updatedAnswer, error: updateError } = await supabase
      .from("answers")
      .update({
        transcript_text: result.text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", answerId)
      .select()
      .single();

    if (updateError) {
      console.error("[Transcribe Error] Failed to update answer:", updateError);
      return NextResponse.json({ error: "Failed to save transcript" }, { status: 500 });
    }

    // Track transcription event
    await supabase.from("events").insert({
      user_id: user.id,
      event_type: "transcription_completed",
      session_id: answer.session_id,
      payload: {
        answer_id: answerId,
        duration_seconds: result.duration,
        language: result.language,
      },
    });

    return NextResponse.json({
      text: result.text,
      partial: result.partial,
      duration: result.duration,
      language: result.language,
      answerId: updatedAnswer.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Transcribe Route Error]", message);

    return NextResponse.json({ error: "Transcription failed: " + message }, { status: 500 });
  }
}
