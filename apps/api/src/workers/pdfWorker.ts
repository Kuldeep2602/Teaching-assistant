import { Worker } from "bullmq";
import type { GeneratedPaper } from "@veda/shared";
import { connectToMongo } from "../db/mongoose.js";
import { queueConnection } from "../db/redis.js";
import { AssignmentModel } from "../models/Assignment.js";
import { GeneratedPaperModel } from "../models/GeneratedPaper.js";
import { updateAssignmentStatus, emitAssignmentStatus } from "../services/assignmentService.js";
import { renderPaperPdf } from "../services/pdf/renderPaperPdf.js";
import { invalidateAssignmentCaches } from "../services/storage/cache.js";

export const startPdfWorker = async () => {
  await connectToMongo();

  return new Worker(
    "paper-pdf-export",
    async (job) => {
      const assignment = await AssignmentModel.findById(job.data.assignmentId).exec();
      const generatedPaper = await GeneratedPaperModel.findOne({
        assignmentId: job.data.assignmentId
      }).lean<{ paper?: GeneratedPaper } | null>();

      if (!assignment || !generatedPaper?.paper) {
        throw new Error("Generated paper not found for PDF export");
      }

      const pdf = await renderPaperPdf(assignment._id.toString(), generatedPaper.paper);

      await updateAssignmentStatus(assignment._id.toString(), {
        status: "pdf_ready",
        pdfUrl: pdf.publicUrl,
        errorMessage: null
      });

      await invalidateAssignmentCaches(assignment._id.toString());

      await emitAssignmentStatus({
        assignmentId: assignment._id.toString(),
        status: "pdf_ready",
        timestamp: new Date().toISOString(),
        message: "PDF ready",
        pdfUrl: pdf.publicUrl
      });
    },
    {
      connection: queueConnection
    }
  );
};
