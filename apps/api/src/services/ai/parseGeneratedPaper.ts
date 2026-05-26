import type { AssignmentDocument } from "../../models/Assignment.js";
import { generatedPaperSchema, type GeneratedPaper, type PaperQuestion, type PaperSection } from "@veda/shared";

type RawRecord = Record<string, unknown>;

const stripCodeFence = (value: string) =>
  value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");

const asRecord = (value: unknown): RawRecord => (value && typeof value === "object" ? (value as RawRecord) : {});

const readString = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

const getStringField = (record: RawRecord, fieldNames: string[]) => {
  for (const fieldName of fieldNames) {
    const value = readString(record[fieldName]);
    if (value) {
      return value;
    }
  }

  return undefined;
};

const answerFieldNames = [
  "answer",
  "correctAnswer",
  "correct_answer",
  "expectedAnswer",
  "expected_answer",
  "modelAnswer",
  "model_answer",
  "solution",
  "finalAnswer",
  "final_answer",
  "answerText",
  "answer_text",
  "correctOption",
  "correct_option"
];

const normalizeDifficulty = (value: string): "easy" | "medium" | "hard" => {
  const normalized = value.toLowerCase().trim();
  if (normalized === "easy") return "easy";
  if (normalized === "medium" || normalized === "moderate") return "medium";
  if (normalized === "hard" || normalized === "challenging") return "hard";
  throw new Error("The AI returned an invalid difficulty level. Please try generating again.");
};

const placeholderPatterns = [
  /\bwrite\s+an?\s+.*\bquestion\b/i,
  /\bgenerate\s+an?\s+.*\bquestion\b/i,
  /\bcreate\s+an?\s+.*\bquestion\b/i,
  /\bquestion text\b/i,
  /\bexpected answer\b/i,
  /\bmodel answer\b/i,
  /\baccepted explanation\b/i
];

const ensureExamReadyText = (value: string, label: string) => {
  if (placeholderPatterns.some((pattern) => pattern.test(value))) {
    throw new Error(`The AI produced a placeholder ${label} instead of real content. Please try generating again.`);
  }
};

export const parseGeneratedPaper = (rawText: string, assignment: AssignmentDocument): GeneratedPaper => {
  const parsed = JSON.parse(stripCodeFence(rawText)) as GeneratedPaper;

  if (parsed.sections.length !== assignment.questionTypes.length) {
    throw new Error("The AI generated an incorrect number of sections. Please try generating again.");
  }

  const parsedAnswerKey = Array.isArray(parsed.answerKey) ? parsed.answerKey : [];
  const getAnswerKeyAnswer = (index: number, questionNumber: number) => {
    const matchingItem = parsedAnswerKey.find((item) => asRecord(item).questionNumber === questionNumber);
    return getStringField(asRecord(matchingItem ?? parsedAnswerKey[index]), answerFieldNames);
  };

  let questionNumber = 1;
  const sections: PaperSection[] = parsed.sections.map((section, sectionIndex) => {
    const requestedConfig = assignment.questionTypes[sectionIndex];
    if (!requestedConfig) {
      throw new Error("The AI returned an unexpected section layout. Please try generating again.");
    }

    if (section.questions.length !== requestedConfig.questionCount) {
      throw new Error(
        `Section ${sectionIndex + 1} has ${section.questions.length} questions instead of the requested ${requestedConfig.questionCount}. Please try generating again.`
      );
    }

    const questions: PaperQuestion[] = section.questions.map((question) => {
      const currentQuestionNumber = questionNumber++;
      const questionRecord = asRecord(question);
      const answer =
        getStringField(questionRecord, answerFieldNames) ||
        getAnswerKeyAnswer(currentQuestionNumber - 1, currentQuestionNumber);

      if (!answer) {
        throw new Error(`Question ${currentQuestionNumber} is missing an answer. Please try generating again.`);
      }

      return {
        ...question,
        id: question.id || `q-${currentQuestionNumber}`,
        questionNumber: currentQuestionNumber,
        difficulty: normalizeDifficulty(question.difficulty),
        marks: requestedConfig?.marksPerQuestion ?? question.marks,
        answer,
        type: question.type || requestedConfig?.type || "General"
      };
    });

    questions.forEach((question) => {
      ensureExamReadyText(question.text, "question");
      ensureExamReadyText(question.answer, "answer");
    });

    return {
      ...section,
      id: section.id || `section-${sectionIndex + 1}`,
      title: section.title || `Section ${String.fromCharCode(65 + sectionIndex)}`,
      instruction: section.instruction || `Attempt all questions in Section ${String.fromCharCode(65 + sectionIndex)}.`,
      questions
    };
  });

  const totalMarks = sections.reduce(
    (sum, section) => sum + section.questions.reduce((sectionSum, question) => sectionSum + question.marks, 0),
    0
  );

  const flattenedQuestions = sections.flatMap((section) => section.questions);
  const answerKey = flattenedQuestions.map((question, index) => ({
      questionNumber: question.questionNumber,
      answer: getAnswerKeyAnswer(index, question.questionNumber) || question.answer,
      explanation: readString(asRecord(parsedAnswerKey[index]).explanation) ?? ""
    }));

  answerKey.forEach((item) => {
    ensureExamReadyText(item.answer, "answer");
    if (item.explanation) {
      ensureExamReadyText(item.explanation, "explanation");
    }
  });

  return generatedPaperSchema.parse({
    ...parsed,
    title: parsed.title || assignment.title,
    subject: parsed.subject || assignment.subject,
    className: parsed.className || assignment.className,
    durationMinutes: assignment.durationMinutes,
    sections,
    answerKey,
    instructions:
      parsed.instructions?.length > 0
        ? parsed.instructions
        : ["All questions are compulsory unless stated otherwise."],
    totalMarks
  });
};
