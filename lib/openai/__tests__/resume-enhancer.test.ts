/**
 * Resume Enhancer Tests
 */

import { enhanceContent } from "../resume-enhancer";
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
  calculateGPTCost: jest.fn(() => 0.003),
}));

describe("enhanceContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should enhance job description and return suggestions", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              needs_clarification: false,
              suggestions: [
                "Led social media campaigns across 5+ platforms, increasing engagement by 40%",
                "Managed social media strategy for Fortune 500 client, growing followers from 2K to 15K",
              ],
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
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

    const result = await enhanceContent({
      job_description: "Managed social media accounts",
      context: { company: "Acme Corp", title: "Marketing Coordinator" },
    });

    expect(result.needs_clarification).toBe(false);
    expect(result.suggestions).toHaveLength(2);
    expect(result.suggestions[0]).toContain("social media");
    expect(trackCost).toHaveBeenCalled();
  });

  it("should request clarification for vague descriptions", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              needs_clarification: true,
              questions: ["How many accounts did you manage?", "What results did you achieve?"],
              suggestions: [],
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 80,
        completion_tokens: 30,
        total_tokens: 110,
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

    const result = await enhanceContent({
      job_description: "Did stuff",
    });

    expect(result.needs_clarification).toBe(true);
    expect(result.questions).toHaveLength(2);
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
      enhanceContent({
        job_description: "Test description",
      })
    ).rejects.toThrow("Failed to enhance content");
  });
});
