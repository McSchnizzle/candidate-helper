/**
 * Resume Draft Storage Utilities
 * Handles localStorage persistence for guest users
 */

import type { ResumeData, ResumeStep } from "@/lib/types/resume-builder";

const STORAGE_KEY = "resume_builder_draft";
const STORAGE_EXPIRY_DAYS = 7;

interface StoredDraft {
  data: ResumeData;
  step_completed: ResumeStep | null;
  expires_at: number;
}

/**
 * Save draft to localStorage
 */
export function saveLocalDraft(data: ResumeData, step?: ResumeStep): void {
  try {
    const draft: StoredDraft = {
      data,
      step_completed: step || null,
      expires_at: Date.now() + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error("Failed to save draft to localStorage:", error);
  }
}

/**
 * Load draft from localStorage
 */
export function loadLocalDraft(): { data: ResumeData; step_completed: ResumeStep | null } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const draft: StoredDraft = JSON.parse(stored);

    // Check if expired
    if (draft.expires_at < Date.now()) {
      clearLocalDraft();
      return null;
    }

    return {
      data: draft.data,
      step_completed: draft.step_completed,
    };
  } catch (error) {
    console.error("Failed to load draft from localStorage:", error);
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearLocalDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear draft from localStorage:", error);
  }
}

/**
 * Migrate localStorage draft to database
 */
export async function migrateLocalDraftToServer(): Promise<void> {
  const localDraft = loadLocalDraft();
  if (!localDraft) return;

  try {
    const response = await fetch("/api/resume-builder/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: localDraft.data,
        step_completed: localDraft.step_completed,
      }),
    });

    if (response.ok) {
      // Successfully migrated, clear localStorage
      clearLocalDraft();
    }
  } catch (error) {
    console.error("Failed to migrate draft to server:", error);
  }
}
