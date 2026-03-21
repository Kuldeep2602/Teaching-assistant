import { Router } from "express";
import { assignmentInputSchema, type AssignmentInput } from "@veda/shared";
import { generationQueue, pdfQueue } from "../db/redis.js";
import {
  createAssignment,
  deleteAssignment,
  emitAssignmentStatus,
  getAssignmentById,
  getAssignments,
  resetGeneratedPaper,
  updateAssignmentStatus
} from "../services/assignmentService.js";
import { uploadMiddleware } from "../services/storage/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const parseAssignmentInput = (body: Record<string, unknown>): AssignmentInput =>
  assignmentInputSchema.parse({
    title: body.title,
    subject: body.subject,
    className: body.className,
    durationMinutes: Number(body.durationMinutes),
    dueDate: body.dueDate,
    additionalInstructions: body.additionalInstructions,
    questionTypes:
      typeof body.questionTypes === "string" ? JSON.parse(body.questionTypes) : body.questionTypes
  });

export const assignmentsRouter = Router();

assignmentsRouter.get(
  "/assignments",
  asyncHandler(async (_request, response) => {
    const assignments = await getAssignments();
    response.json(assignments);
  })
);

assignmentsRouter.get(
  "/assignments/:id",
  asyncHandler(async (request, response) => {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const assignment = await getAssignmentById(id);
    if (!assignment) {
      response.status(404).json({ message: "Assignment not found" });
      return;
    }

    response.json(assignment);
  })
);

assignmentsRouter.post(
  "/assignments",
  uploadMiddleware.single("sourceFile"),
  asyncHandler(async (request, response) => {
    const parsedInput = parseAssignmentInput(request.body as Record<string, unknown>);

    const upload = request.file
      ? {
          originalName: request.file.originalname,
          mimeType: request.file.mimetype,
          path: request.file.path,
          extractedText: ""
        }
      : undefined;

    const assignment = await createAssignment(parsedInput, upload);
    response.status(201).json(assignment);
  })
);

assignmentsRouter.post(
  "/assignments/:id/generate",
  asyncHandler(async (request, response) => {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    await resetGeneratedPaper(id);
    const assignment = await updateAssignmentStatus(id, {
      status: "queued",
      errorMessage: null,
      pdfUrl: null
    });

    if (!assignment) {
      response.status(404).json({ message: "Assignment not found" });
      return;
    }

    await generationQueue.add(
      "generate-paper",
      { assignmentId: assignment.id },
      {
        attempts: 2,
        removeOnComplete: 50,
        removeOnFail: 50
      }
    );

    await emitAssignmentStatus({
      assignmentId: assignment.id,
      status: "queued",
      timestamp: new Date().toISOString(),
      message: "Generation queued"
    });

    response.json(assignment);
  })
);

assignmentsRouter.post(
  "/assignments/:id/export-pdf",
  asyncHandler(async (request, response) => {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const assignment = await getAssignmentById(id);
    if (!assignment) {
      response.status(404).json({ message: "Assignment not found" });
      return;
    }

    if (!assignment.generatedPaper) {
      response.status(400).json({ message: "Generate the paper before exporting a PDF" });
      return;
    }

    if (assignment.pdfUrl) {
      response.json({ queued: false, pdfUrl: assignment.pdfUrl });
      return;
    }

    await pdfQueue.add(
      "export-paper-pdf",
      { assignmentId: assignment.id },
      {
        removeOnComplete: 50,
        removeOnFail: 50
      }
    );

    response.json({ queued: true, pdfUrl: null });
  })
);

assignmentsRouter.delete(
  "/assignments/:id",
  asyncHandler(async (request, response) => {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const deleted = await deleteAssignment(id);
    if (!deleted) {
      response.status(404).json({ message: "Assignment not found" });
      return;
    }

    response.status(204).send();
  })
);
