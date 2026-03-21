import type { AssignmentDocument } from "../models/Assignment.js";

export const buildPrompt = (assignment: AssignmentDocument, extractedText?: string) => {
  const questionSummary = assignment.questionTypes
    .map(
      (item, index) =>
        `Section ${String.fromCharCode(65 + index)}: ${item.type}, ${item.questionCount} questions, ${item.marksPerQuestion} marks each`
    )
    .join("\n");

  const sourceContext = extractedText
    ? `Use this source material as grounding context:\n${extractedText.slice(0, 12000)}`
    : "No source file was uploaded. Generate from the assignment details and instructions only.";

  return [
    "You are generating a school assessment paper.",
    "Return valid JSON only. Do not wrap the response in markdown.",
    "Create a balanced paper with sections, difficulty tags, and an answer key.",
    "Every question must be exam-ready and directly ask the student to answer something.",
    "Do not output meta-instructions such as 'write a question', 'generate a question', 'question text', 'expected answer', or 'model answer'.",
    "Each answer key entry must contain the actual answer, not a placeholder.",
    "For multiple choice questions, include the answer options inside the question text.",
    "JSON shape:",
    JSON.stringify(
      {
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        durationMinutes: assignment.durationMinutes,
        instructions: ["Attempt all questions"],
        totalMarks: assignment.totalMarks,
        sections: [
          {
            id: "section-a",
            title: "Section A",
            instruction: "Attempt all questions",
            questions: [
              {
                id: "q-1",
                questionNumber: 1,
                text: "Question text",
                difficulty: "easy",
                marks: 2,
                answer: "Expected answer",
                type: "Short Questions"
              }
            ]
          }
        ],
        answerKey: [
          {
            questionNumber: 1,
            answer: "Expected answer",
            explanation: "Why this is correct"
          }
        ]
      },
      null,
      2
    ),
    `Assignment title: ${assignment.title}`,
    `Subject: ${assignment.subject}`,
    `Class: ${assignment.className}`,
    `Duration minutes: ${assignment.durationMinutes}`,
    `Due date: ${assignment.dueDate}`,
    `Teacher instructions: ${assignment.additionalInstructions || "None"}`,
    `Question plan:\n${questionSummary}`,
    sourceContext,
    "Make the sections match the requested question types and counts exactly.",
    "Difficulty must be one of easy, medium, hard.",
    "Marks on each question must match the requested marks per question.",
    "Do not leave any field generic or blank."
  ].join("\n\n");
};
