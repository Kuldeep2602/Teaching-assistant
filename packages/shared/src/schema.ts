import { z } from "zod";
import { DIFFICULTIES, JOB_STATUSES, QUESTION_TYPE_OPTIONS } from "./constants.js";

export const difficultySchema = z.enum(DIFFICULTIES);
export const jobStatusSchema = z.enum(JOB_STATUSES);
export const questionTypeOptionSchema = z.enum(QUESTION_TYPE_OPTIONS);

export const questionTypeConfigSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  questionCount: z.number().int().positive(),
  marksPerQuestion: z.number().int().positive()
});

export const assignmentInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  className: z.string().trim().min(1, "Class is required"),
  durationMinutes: z.number().int().positive("Duration must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  additionalInstructions: z.string().trim().optional().default(""),
  questionTypes: z.array(questionTypeConfigSchema).min(1, "At least one question type is required")
});

export const answerKeyItemSchema = z.object({
  questionNumber: z.number().int().positive(),
  answer: z.string().trim().min(1),
  explanation: z.string().trim().optional().default("")
});

export const paperQuestionSchema = z.object({
  id: z.string().min(1),
  questionNumber: z.number().int().positive(),
  text: z.string().trim().min(1),
  difficulty: difficultySchema,
  marks: z.number().int().positive(),
  answer: z.string().trim().min(1),
  type: z.string().trim().min(1)
});

export const paperSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  instruction: z.string().trim().min(1),
  questions: z.array(paperQuestionSchema).min(1)
});

export const generatedPaperSchema = z.object({
  title: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  className: z.string().trim().min(1),
  durationMinutes: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  sections: z.array(paperSectionSchema).min(1),
  answerKey: z.array(answerKeyItemSchema).min(1),
  instructions: z.array(z.string().trim().min(1)).min(1)
});

export const assignmentUploadSchema = z.object({
  originalName: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  provider: z.enum(["local", "supabase"]).default("local"),
  bucket: z.string().trim().optional(),
  path: z.string().trim().min(1),
  publicUrl: z.string().trim().nullable().optional().default(null),
  extractedText: z.string().trim().optional().default("")
});

export const assignmentRecordSchema = assignmentInputSchema.extend({
  id: z.string().min(1),
  status: jobStatusSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  totalQuestions: z.number().int().nonnegative(),
  totalMarks: z.number().int().nonnegative(),
  pdfUrl: z.string().nullable().default(null),
  errorMessage: z.string().nullable().default(null),
  upload: assignmentUploadSchema.nullable().default(null),
  generatedPaper: generatedPaperSchema.nullable().default(null)
});

export const assignmentStatusEventSchema = z.object({
  assignmentId: z.string().min(1),
  status: jobStatusSchema,
  timestamp: z.string().min(1),
  message: z.string().optional(),
  errorMessage: z.string().optional(),
  pdfUrl: z.string().optional()
});

export type QuestionTypeConfig = z.infer<typeof questionTypeConfigSchema>;
export type AssignmentInput = z.infer<typeof assignmentInputSchema>;
export type PaperQuestion = z.infer<typeof paperQuestionSchema>;
export type PaperSection = z.infer<typeof paperSectionSchema>;
export type AnswerKeyItem = z.infer<typeof answerKeyItemSchema>;
export type GeneratedPaper = z.infer<typeof generatedPaperSchema>;
export type AssignmentUpload = z.infer<typeof assignmentUploadSchema>;
export type AssignmentRecord = z.infer<typeof assignmentRecordSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type SocketEventPayload = z.infer<typeof assignmentStatusEventSchema>;
