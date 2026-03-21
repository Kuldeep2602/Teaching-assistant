"use client";

import { create } from "zustand";
import { QUESTION_TYPE_OPTIONS, assignmentInputSchema, type AssignmentInput, type QuestionTypeConfig } from "@veda/shared";

type FormValues = {
  title: string;
  subject: string;
  className: string;
  durationMinutes: string;
  dueDate: string;
  additionalInstructions: string;
  questionTypes: QuestionTypeConfig[];
  file: File | null;
};

type FormStore = FormValues & {
  errors: Record<string, string>;
  setField: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
  addQuestionType: () => void;
  updateQuestionType: (id: string, patch: Partial<QuestionTypeConfig>) => void;
  removeQuestionType: (id: string) => void;
  validate: () => AssignmentInput | null;
  reset: () => void;
};

const makeQuestionType = (type: QuestionTypeConfig["type"] = QUESTION_TYPE_OPTIONS[0]): QuestionTypeConfig => ({
  id: crypto.randomUUID(),
  type,
  questionCount: 1,
  marksPerQuestion: 1
});

const initialState = (): FormValues => ({
  title: "",
  subject: "",
  className: "",
  durationMinutes: "45",
  dueDate: "",
  additionalInstructions: "",
  questionTypes: [makeQuestionType()],
  file: null
});

export const useAssignmentFormStore = create<FormStore>((set, get) => ({
  ...initialState(),
  errors: {},
  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
      errors: {
        ...state.errors,
        [field]: ""
      }
    })),
  addQuestionType: () =>
    set((state) => ({
      questionTypes: [...state.questionTypes, makeQuestionType(QUESTION_TYPE_OPTIONS[state.questionTypes.length % QUESTION_TYPE_OPTIONS.length])]
    })),
  updateQuestionType: (id, patch) =>
    set((state) => ({
      questionTypes: state.questionTypes.map((item) => (item.id === id ? { ...item, ...patch } : item))
    })),
  removeQuestionType: (id) =>
    set((state) => ({
      questionTypes: state.questionTypes.length > 1 ? state.questionTypes.filter((item) => item.id !== id) : state.questionTypes
    })),
  validate: () => {
    const state = get();
    const parsed = assignmentInputSchema.safeParse({
      title: state.title,
      subject: state.subject,
      className: state.className,
      durationMinutes: Number(state.durationMinutes),
      dueDate: state.dueDate,
      additionalInstructions: state.additionalInstructions,
      questionTypes: state.questionTypes
    });

    const file = state.file;
    const nextErrors: Record<string, string> = {};

    if (file) {
      const isValidType = ["application/pdf", "text/plain"].includes(file.type) || /\.(pdf|txt)$/i.test(file.name);
      if (!isValidType) {
        nextErrors.file = "Only PDF or TXT files are allowed.";
      }
    }

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path.join(".") || "form";
        nextErrors[key] = issue.message;
      });
    }

    set({ errors: nextErrors });
    return parsed.success && !nextErrors.file ? parsed.data : null;
  },
  reset: () =>
    set({
      ...initialState(),
      errors: {}
    })
}));
