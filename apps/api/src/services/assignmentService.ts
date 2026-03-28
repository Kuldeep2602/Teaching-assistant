import fs from "node:fs/promises";
import path from "node:path";
import type { AssignmentInput, AssignmentRecord, SocketEventPayload } from "@veda/shared";
import { env } from "../config/env.js";
import { AssignmentModel, type AssignmentDocument } from "../models/Assignment.js";
import { GeneratedPaperModel } from "../models/GeneratedPaper.js";
import {
  cacheAssignment,
  cacheAssignmentList,
  getCachedAssignment,
  getCachedAssignmentList,
  invalidateAssignmentCaches
} from "./storage/cache.js";
import { deleteStoredUpload } from "./storage/objectStore.js";
import { publishAssignmentEvent } from "./socket/eventBus.js";

const unlinkIfPresent = async (filePath?: string | null) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
};

const mapAssignment = async (assignment: AssignmentDocument): Promise<AssignmentRecord> => {
  const generatedPaper = await GeneratedPaperModel.findOne({
    assignmentId: assignment._id
  }).lean<{ paper?: AssignmentRecord["generatedPaper"] } | null>();

  return {
    id: assignment._id.toString(),
    title: assignment.title,
    subject: assignment.subject,
    className: assignment.className,
    durationMinutes: assignment.durationMinutes,
    dueDate: assignment.dueDate,
    additionalInstructions: assignment.additionalInstructions,
    questionTypes: assignment.questionTypes,
    totalQuestions: assignment.totalQuestions,
    totalMarks: assignment.totalMarks,
    status: assignment.status,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    pdfUrl: assignment.pdfUrl ?? null,
    errorMessage: assignment.errorMessage ?? null,
    upload: assignment.upload
      ? {
          originalName: assignment.upload.originalName,
          mimeType: assignment.upload.mimeType,
          provider: assignment.upload.provider,
          bucket: assignment.upload.bucket ?? undefined,
          path: assignment.upload.path,
          publicUrl: assignment.upload.publicUrl ?? null,
          extractedText: assignment.upload.extractedText ?? ""
        }
      : null,
    generatedPaper: generatedPaper?.paper ?? null
  };
};

export const createAssignment = async (input: AssignmentInput, upload?: AssignmentRecord["upload"]) => {
  const totalQuestions = input.questionTypes.reduce((sum, item) => sum + item.questionCount, 0);
  const totalMarks = input.questionTypes.reduce((sum, item) => sum + item.questionCount * item.marksPerQuestion, 0);

  const assignment = await AssignmentModel.create({
    ...input,
    totalQuestions,
    totalMarks,
    upload
  });

  const record = await mapAssignment(assignment);
  await invalidateAssignmentCaches(record.id);
  return record;
};

export const getAssignments = async () => {
  const cached = await getCachedAssignmentList();
  if (cached) {
    return cached;
  }

  const assignments = await AssignmentModel.find().sort({ createdAt: -1 }).exec();
  const mapped = await Promise.all(assignments.map((assignment) => mapAssignment(assignment)));
  await cacheAssignmentList(mapped);
  return mapped;
};

export const getAssignmentById = async (id: string) => {
  const cached = await getCachedAssignment(id);
  if (cached) {
    return cached;
  }

  const assignment = await AssignmentModel.findById(id).exec();
  if (!assignment) {
    return null;
  }

  const mapped = await mapAssignment(assignment);
  await cacheAssignment(mapped);
  return mapped;
};

export const updateAssignmentStatus = async (
  id: string,
  payload: Partial<Pick<AssignmentRecord, "status" | "pdfUrl" | "errorMessage">>
) => {
  const updated = await AssignmentModel.findByIdAndUpdate(
    id,
    {
      ...payload
    },
    { new: true }
  ).exec();

  if (!updated) {
    return null;
  }

  const mapped = await mapAssignment(updated);
  await invalidateAssignmentCaches(id);
  await cacheAssignment(mapped);
  return mapped;
};

export const saveGeneratedPaper = async (params: {
  assignmentId: string;
  provider: string;
  prompt: string;
  paper: AssignmentRecord["generatedPaper"];
}) => {
  await GeneratedPaperModel.findOneAndUpdate(
    { assignmentId: params.assignmentId },
    {
      assignmentId: params.assignmentId,
      provider: params.provider,
      prompt: params.prompt,
      paper: params.paper
    },
    { upsert: true, new: true }
  );

  await invalidateAssignmentCaches(params.assignmentId);
};

export const resetGeneratedPaper = async (assignmentId: string) => {
  await GeneratedPaperModel.deleteOne({ assignmentId });
  await invalidateAssignmentCaches(assignmentId);
};

export const deleteAssignment = async (id: string) => {
  const assignment = await AssignmentModel.findById(id).exec();
  if (!assignment) {
    return false;
  }

  const pdfPath = assignment.pdfUrl
    ? path.resolve(env.PDF_OUTPUT_DIR, path.basename(assignment.pdfUrl))
    : null;

  await GeneratedPaperModel.deleteOne({ assignmentId: assignment._id });
  await assignment.deleteOne();
  await Promise.all([
    deleteStoredUpload(assignment.upload ?? null),
    unlinkIfPresent(pdfPath),
    invalidateAssignmentCaches(id)
  ]);

  return true;
};

export const emitAssignmentStatus = async (event: SocketEventPayload) => {
  await publishAssignmentEvent(event);
};
