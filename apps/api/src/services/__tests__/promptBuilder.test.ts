import { describe, expect, it } from "vitest";
import { buildPrompt } from "../promptBuilder.js";

const mockAssignment = {
  title: "Quiz on Electricity",
  subject: "Science",
  className: "Grade 8",
  durationMinutes: 45,
  dueDate: "2026-03-20",
  additionalInstructions: "Focus on NCERT chapter questions.",
  totalMarks: 20,
  questionTypes: [
    {
      id: "one",
      type: "Short Questions",
      questionCount: 5,
      marksPerQuestion: 2
    },
    {
      id: "two",
      type: "Numerical Problems",
      questionCount: 2,
      marksPerQuestion: 5
    }
  ]
} as const;

describe("buildPrompt", () => {
  it("includes requested sections and extracted text context", () => {
    const prompt = buildPrompt(mockAssignment as never, "Battery, current, and resistance");

    expect(prompt).toContain("Section A: Short Questions, 5 questions, 2 marks each");
    expect(prompt).toContain("Section B: Numerical Problems, 2 questions, 5 marks each");
    expect(prompt).toContain("Battery, current, and resistance");
  });
});
