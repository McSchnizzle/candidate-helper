"use client";

/**
 * Resume Builder Main Page
 * Multi-step resume building interface
 */

import { useState, useEffect } from "react";
import { BuilderStepper } from "@/components/resume-builder/BuilderStepper";
import { BasicInfoForm } from "@/components/resume-builder/BasicInfoForm";
import { WorkHistoryBuilder } from "@/components/resume-builder/WorkHistoryBuilder";
import { EducationSkillsForm } from "@/components/resume-builder/EducationSkillsForm";
import { SummaryGenerator } from "@/components/resume-builder/SummaryGenerator";
import { ResumePreview } from "@/components/resume-builder/ResumePreview";
import { LinkedInImportModal } from "@/components/resume-builder/LinkedInImportModal";
import { Download } from "lucide-react";
import { saveLocalDraft, loadLocalDraft, migrateLocalDraftToServer } from "@/lib/utils/resume-storage";
import { trackEvent } from "@/lib/utils/track-event";
import type { ResumeStep, ResumeData } from "@/lib/types/resume-builder";

const STEP_ORDER: ResumeStep[] = ["basic_info", "work_history", "education", "summary", "review"];

export default function ResumeBuilderPage() {
  const [currentStep, setCurrentStep] = useState<ResumeStep>("basic_info");
  const [completedSteps, setCompletedSteps] = useState<ResumeStep[]>([]);
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSignUpBanner, setShowSignUpBanner] = useState(false);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(resumeData).length > 0) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [resumeData, isAuthenticated]);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
    trackEvent("resume_builder_started" as any);
  }, []);

  async function loadDraft() {
    try {
      // Try to load from server first
      const response = await fetch("/api/resume-builder/draft");

      if (response.status === 401) {
        // User is not authenticated, load from localStorage
        setIsAuthenticated(false);
        const localDraft = loadLocalDraft();
        if (localDraft) {
          setResumeData(localDraft.data || {});
          if (localDraft.step_completed) {
            setCurrentStep(localDraft.step_completed);
            const stepIndex = STEP_ORDER.indexOf(localDraft.step_completed);
            setCompletedSteps(STEP_ORDER.slice(0, stepIndex));
          }
        }
        setShowSignUpBanner(true);
      } else if (response.ok) {
        // User is authenticated
        setIsAuthenticated(true);
        const { draft } = await response.json();
        if (draft) {
          setResumeData(draft.data || {});
          if (draft.step_completed) {
            setCurrentStep(draft.step_completed);
            const stepIndex = STEP_ORDER.indexOf(draft.step_completed);
            setCompletedSteps(STEP_ORDER.slice(0, stepIndex));
          }
        }

        // Try to migrate localStorage draft if exists
        await migrateLocalDraftToServer();
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
      // Fallback to localStorage
      setIsAuthenticated(false);
      const localDraft = loadLocalDraft();
      if (localDraft) {
        setResumeData(localDraft.data || {});
        if (localDraft.step_completed) {
          setCurrentStep(localDraft.step_completed);
        }
      }
    }
  }

  async function saveDraft() {
    try {
      setIsSaving(true);

      if (isAuthenticated) {
        // Save to server
        await fetch("/api/resume-builder/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step_completed: currentStep,
            data: resumeData,
          }),
        });
      } else {
        // Save to localStorage
        saveLocalDraft(resumeData, currentStep);
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      // Fallback to localStorage
      saveLocalDraft(resumeData, currentStep);
    } finally {
      setIsSaving(false);
    }
  }

  function handleLinkedInImport(data: Partial<ResumeData>) {
    setResumeData({ ...resumeData, ...data });
    saveDraft();
    trackEvent("resume_linkedin_imported" as any);
  }

  function handleStepComplete(stepData: Partial<ResumeData>) {
    const updatedData = { ...resumeData, ...stepData };
    setResumeData(updatedData);

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Track step completion
    trackEvent("resume_builder_step_completed" as any, { step_name: currentStep });

    // Move to next step
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }

    saveDraft();
  }

  function handleBack() {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sign-up Banner for Guest Users */}
        {showSignUpBanner && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">
                Sign up to save your resume in the cloud
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Your resume is currently saved in your browser. Create an account to access it from any device.
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Sign Up
              </a>
              <button
                onClick={() => setShowSignUpBanner(false)}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Build Your Resume</h1>
              <p className="mt-2 text-gray-600">
                Let's create a professional resume together. I'll guide you through each step.
              </p>
              {isSaving && (
                <p className="mt-2 text-sm text-blue-600">Saving draft...</p>
              )}
            </div>
            {currentStep === "basic_info" && (
              <button
                onClick={() => setShowLinkedInModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Import from LinkedIn
              </button>
            )}
          </div>
        </div>

        {/* Stepper */}
        <BuilderStepper currentStep={currentStep} completedSteps={completedSteps} />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === "basic_info" && (
            <BasicInfoForm
              initialData={resumeData.basic_info}
              onComplete={(data) => handleStepComplete({ basic_info: data })}
            />
          )}

          {currentStep === "work_history" && (
            <WorkHistoryBuilder
              initialData={resumeData.work_history || []}
              onComplete={(data) => handleStepComplete({ work_history: data })}
              onBack={handleBack}
            />
          )}

          {currentStep === "education" && (
            <EducationSkillsForm
              initialEducation={resumeData.education || []}
              initialSkills={resumeData.skills || []}
              workHistory={resumeData.work_history || []}
              onComplete={(education, skills) =>
                handleStepComplete({ education, skills })
              }
              onBack={handleBack}
            />
          )}

          {currentStep === "summary" && (
            <SummaryGenerator
              initialSummary={resumeData.summary}
              workHistory={resumeData.work_history || []}
              education={resumeData.education || []}
              skills={resumeData.skills || []}
              onComplete={(summary) => handleStepComplete({ summary })}
              onBack={handleBack}
            />
          )}

          {currentStep === "review" && (
            <ResumePreview
              resumeData={resumeData}
              onBack={handleBack}
              onEdit={(step) => setCurrentStep(step)}
            />
          )}
        </div>

        {/* LinkedIn Import Modal */}
        <LinkedInImportModal
          isOpen={showLinkedInModal}
          onClose={() => setShowLinkedInModal(false)}
          onImport={handleLinkedInImport}
        />
      </div>
    </div>
  );
}
