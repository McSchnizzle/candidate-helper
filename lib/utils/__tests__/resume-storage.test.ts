/**
 * Resume Storage Tests
 */

import {
  saveLocalDraft,
  loadLocalDraft,
  clearLocalDraft,
} from "../resume-storage";
import type { ResumeData } from "@/lib/types/resume-builder";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("resume-storage", () => {
  const mockResumeData: ResumeData = {
    basic_info: {
      full_name: "Test User",
      email: "test@example.com",
    },
    work_history: [],
    education: [],
    skills: ["JavaScript"],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveLocalDraft", () => {
    it("should save draft to localStorage", () => {
      saveLocalDraft(mockResumeData, "basic_info");

      const stored = localStorage.getItem("resume_builder_draft");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(mockResumeData);
      expect(parsed.step_completed).toBe("basic_info");
    });

    it("should set expiry date 7 days in future", () => {
      const now = Date.now();
      saveLocalDraft(mockResumeData);

      const stored = localStorage.getItem("resume_builder_draft");
      const parsed = JSON.parse(stored!);

      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(parsed.expires_at).toBeGreaterThan(now);
      expect(parsed.expires_at).toBeLessThanOrEqual(now + sevenDays + 1000);
    });
  });

  describe("loadLocalDraft", () => {
    it("should load draft from localStorage", () => {
      saveLocalDraft(mockResumeData, "work_history");

      const loaded = loadLocalDraft();

      expect(loaded).toBeTruthy();
      expect(loaded?.data).toEqual(mockResumeData);
      expect(loaded?.step_completed).toBe("work_history");
    });

    it("should return null if no draft exists", () => {
      const loaded = loadLocalDraft();
      expect(loaded).toBeNull();
    });

    it("should return null and clear if draft is expired", () => {
      const expiredDraft = {
        data: mockResumeData,
        step_completed: "basic_info",
        expires_at: Date.now() - 1000, // Expired 1 second ago
      };

      localStorage.setItem("resume_builder_draft", JSON.stringify(expiredDraft));

      const loaded = loadLocalDraft();
      expect(loaded).toBeNull();

      const stored = localStorage.getItem("resume_builder_draft");
      expect(stored).toBeNull();
    });
  });

  describe("clearLocalDraft", () => {
    it("should remove draft from localStorage", () => {
      saveLocalDraft(mockResumeData);

      clearLocalDraft();

      const stored = localStorage.getItem("resume_builder_draft");
      expect(stored).toBeNull();
    });
  });
});
