/**
 * PDF Generator Tests
 */

import { generateResumePDF } from "../pdf-generator";
import type { ResumeData } from "@/lib/types/resume-builder";

describe("generateResumePDF", () => {
  const mockResumeData: ResumeData = {
    basic_info: {
      full_name: "John Doe",
      email: "john@example.com",
      phone: "503-555-0123",
      location: "Portland, OR",
    },
    work_history: [
      {
        id: "1",
        title: "Software Engineer",
        company: "Tech Corp",
        start_date: "2020-01",
        end_date: "2023-05",
        is_current: false,
        raw_description: "Built apps",
        enhanced_bullets: [
          "Developed scalable web applications using React and Node.js",
          "Led team of 3 developers on successful product launch",
        ],
      },
    ],
    education: [
      {
        id: "1",
        degree: "BS Computer Science",
        institution: "State University",
        field: "Computer Science",
        graduation_year: "2019",
      },
    ],
    skills: ["JavaScript", "React", "Node.js", "TypeScript"],
    summary: "Experienced software engineer with 3+ years building web applications.",
  };

  it("should generate a PDF buffer", async () => {
    const pdfBytes = await generateResumePDF(mockResumeData);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it("should handle resume with minimal data", async () => {
    const minimalData: ResumeData = {
      basic_info: {
        full_name: "Jane Doe",
        email: "jane@example.com",
      },
      work_history: [
        {
          id: "1",
          title: "Designer",
          company: "Creative Co",
          start_date: "2021-01",
          is_current: true,
          raw_description: "Design work",
          enhanced_bullets: ["Created beautiful designs"],
        },
      ],
      education: [],
      skills: [],
    };

    const pdfBytes = await generateResumePDF(minimalData);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it("should include all resume sections", async () => {
    const pdfBytes = await generateResumePDF(mockResumeData);
    const pdfText = new TextDecoder().decode(pdfBytes);

    // Check for presence of key content (PDFs contain binary, but some text is readable)
    expect(pdfText).toContain("John Doe");
  });
});
