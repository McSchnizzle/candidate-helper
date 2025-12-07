"use client";

/**
 * LinkedIn Import Modal
 * Allows users to paste LinkedIn profile content for import
 */

import { useState } from "react";
import { X, Loader2, Download } from "lucide-react";
import type { ResumeData } from "@/lib/types/resume-builder";

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Partial<ResumeData>) => void;
}

export function LinkedInImportModal({ isOpen, onClose, onImport }: LinkedInImportModalProps) {
  const [linkedinText, setLinkedinText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  async function handleImport() {
    if (linkedinText.trim().length < 50) {
      alert("Please paste your LinkedIn profile content (at least 50 characters)");
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch("/api/resume-builder/import-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinText }),
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const { data } = await response.json();
      onImport(data);
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import LinkedIn profile. Please try again.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import from LinkedIn</h2>
            <p className="text-gray-600 mt-1">
              Copy and paste your LinkedIn profile content to auto-fill your resume
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Download className="w-5 h-5" />
            How to export from LinkedIn:
          </h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Go to your LinkedIn profile page</li>
            <li>Click "More" → "Save to PDF" or copy the page content</li>
            <li>If using PDF, open it and copy the text</li>
            <li>Paste the content in the box below</li>
          </ol>
          <p className="mt-3 text-sm text-blue-700">
            <strong>Note:</strong> We only extract information you provide. Your LinkedIn profile
            remains private and is not accessed directly.
          </p>
        </div>

        {/* Text Area */}
        <div className="mb-6">
          <label htmlFor="linkedin-text" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your LinkedIn profile content here:
          </label>
          <textarea
            id="linkedin-text"
            value={linkedinText}
            onChange={(e) => setLinkedinText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={12}
            placeholder="Paste your LinkedIn profile text here...

Example:
John Doe
Marketing Manager at Acme Corp
Portland, Oregon

Experience:
Marketing Manager
Acme Corp · Full-time
Jan 2020 - Present
- Led social media campaigns...
..."
          />
          <p className="mt-2 text-sm text-gray-500">
            {linkedinText.length} characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || linkedinText.trim().length < 50}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Profile"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
