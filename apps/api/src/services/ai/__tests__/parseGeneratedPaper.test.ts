import { describe, expect, it } from "vitest";
import { parseGeneratedPaper } from "../parseGeneratedPaper.js";

const mockAssignment = {
  title: "Quiz on Electricity",
  subject: "Science",
  className: "Grade 8",
  durationMinutes: 45,
  questionTypes: [
    {
      id: "one",
      type: "Short Questions",
      questionCount: 2,
      marksPerQuestion: 2
    }
  ]
} as const;

describe("parseGeneratedPaper", () => {
  it("normalizes difficulty labels and recomputes totals", () => {
    const raw = JSON.stringify({
      title: "Quiz on Electricity",
      subject: "Science",
      className: "Grade 8",
      durationMinutes: 45,
      totalMarks: 999,
      instructions: ["Attempt all questions"],
      sections: [
        {
          id: "section-a",
          title: "Section A",
          instruction: "Attempt all questions",
          questions: [
            {
              id: "q-1",
              questionNumber: 88,
              text: "Define electric current.",
              difficulty: "Moderate",
              marks: 9,
              answer: "Rate of flow of charge.",
              type: "Short Questions"
            },
            {
              id: "q-2",
              questionNumber: 89,
              text: "State Ohm's law.",
              difficulty: "challenging",
              marks: 9,
              answer: "V = IR",
              type: "Short Questions"
            }
          ]
        }
      ],
      answerKey: [
        { questionNumber: 1, answer: "Rate of flow of charge.", explanation: "Definition." },
        { questionNumber: 2, answer: "V = IR", explanation: "Formula." }
      ]
    });

    const parsed = parseGeneratedPaper(raw, mockAssignment as never);

    expect(parsed.totalMarks).toBe(4);
    expect(parsed.sections[0]?.questions[0]?.difficulty).toBe("medium");
    expect(parsed.sections[0]?.questions[1]?.difficulty).toBe("hard");
    expect(parsed.sections[0]?.questions[0]?.marks).toBe(2);
    expect(parsed.sections[0]?.questions[0]?.questionNumber).toBe(1);
    expect(parsed.sections[0]?.questions[1]?.questionNumber).toBe(2);
  });

  it("rejects placeholder meta questions", () => {
    const raw = JSON.stringify({
      title: "Quiz on Electricity",
      subject: "Science",
      className: "Grade 8",
      durationMinutes: 45,
      totalMarks: 4,
      instructions: ["Attempt all questions"],
      sections: [
        {
          id: "section-a",
          title: "Section A",
          instruction: "Attempt all questions",
          questions: [
            {
              id: "q-1",
              questionNumber: 1,
              text: "Write a medium level science question for Grade 8.",
              difficulty: "easy",
              marks: 2,
              answer: "Expected answer",
              type: "Short Questions"
            },
            {
              id: "q-2",
              questionNumber: 2,
              text: "State Ohm's law.",
              difficulty: "medium",
              marks: 2,
              answer: "Model answer for question 2.",
              type: "Short Questions"
            }
          ]
        }
      ],
      answerKey: [
        { questionNumber: 1, answer: "Expected answer", explanation: "Accepted explanation for question 1." },
        { questionNumber: 2, answer: "Model answer for question 2.", explanation: "Accepted explanation." }
      ]
    });

    expect(() => parseGeneratedPaper(raw, mockAssignment as never)).toThrow(/placeholder/);
  });
});
