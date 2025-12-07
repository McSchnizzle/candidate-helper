/**
 * Summary Generator Tests
 */

import { generateSummary } from "../summary-generator";
import { trackCost } from "@/lib/utils/cost-tracker";

// Mock OpenAI
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Mock cost tracker
jest.mock("@/lib/utils/cost-tracker", () => ({
  trackCost: jest.fn(),
  calculateGPTCost: jest.fn(() => 0.006),
}));

describe("generateSummary", () => {
  const mockWorkHistory = [
    {
      id: "1",
      title: "Senior Developer",
      company: "Tech Corp",
      start_date: "2020-01",
      end_date: "2023-05",
      is_current: false,
      raw_description: "Built apps",
      enhanced_bullets: ["Developed scalable web applications"],
    },
  ];

  const mockEducation = [
    {
      id: "1",
      degree: "BS Computer Science",
      institution: "State University",
      field: "Computer Science",
      graduation_year: "2019",
    },
  ];

  const mockSkills = ["JavaScript", "React", "Node.js", "TypeScript"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate 3 summary options", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              summaries: [
                "Senior software developer with 3+ years of experience building scalable web applications.",
                "Experienced developer specializing in JavaScript and React with a strong CS background.",
                "Results-driven developer with expertise in full-stack development and modern frameworks.",
              ],
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 200,
        completion_tokens: 100,
        total_tokens: 300,
      },
    };

    const { OpenAI } = require("openai");
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockResponse),
        },
      },
    }));

    const result = await generateSummary({
      work_history: mockWorkHistory,
      education: mockEducation,
      skills: mockSkills,
    });

    expect(result.summaries).toHaveLength(3);
    expect(result.summaries[0]).toContain("developer");
    expect(trackCost).toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    const { OpenAI } = require("openai");
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error("API Error")),
        },
      },
    }));

    await expect(
      generateSummary({
        work_history: mockWorkHistory,
        education: mockEducation,
        skills: mockSkills,
      })
    ).rejects.toThrow("Failed to generate summary");
  });
});
