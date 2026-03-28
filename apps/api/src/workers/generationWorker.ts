import { Worker } from "bullmq";
import { connectToMongo } from "../db/mongoose.js";
import { pdfQueue, queueConnection } from "../db/redis.js";
import { AssignmentModel } from "../models/Assignment.js";
import { updateAssignmentStatus, saveGeneratedPaper, emitAssignmentStatus } from "../services/assignmentService.js";
import { createAiProvider } from "../services/ai/createProvider.js";
import { parseGeneratedPaper } from "../services/ai/parseGeneratedPaper.js";
import { buildPrompt } from "../services/promptBuilder.js";
import { extractTextFromFile } from "../services/storage/textExtraction.js";
import { invalidateAssignmentCaches } from "../services/storage/cache.js";

export const startGenerationWorker = async () => {
  await connectToMongo();
  const resolvedProvider = createAiProvider();
  console.log(
    `Question generation worker using ${resolvedProvider.providerName} provider. ${resolvedProvider.reason}`
  );

  return new Worker(
    "question-generation",
    async (job) => {
      const assignment = await AssignmentModel.findById(job.data.assignmentId).exec();
      if (!assignment) {
        throw new Error("Assignment not found for generation job");
      }

      await updateAssignmentStatus(assignment._id.toString(), {
        status: "processing",
        errorMessage: null
      });

      await emitAssignmentStatus({
        assignmentId: assignment._id.toString(),
        status: "processing",
        timestamp: new Date().toISOString(),
        message: "AI generation in progress"
      });

      try {
        let extractedText = assignment.upload?.extractedText ?? "";

        if (assignment.upload?.path && !extractedText) {
          extractedText = await extractTextFromFile(assignment.upload);
          assignment.upload.extractedText = extractedText;
          await assignment.save();
        }

        const prompt = buildPrompt(assignment, extractedText);
        const result = await resolvedProvider.provider.generatePaper({ assignment, prompt, extractedText });
        const paper = parseGeneratedPaper(result.rawText, assignment);

        await saveGeneratedPaper({
          assignmentId: assignment._id.toString(),
          provider: result.provider,
          prompt: result.prompt,
          paper
        });

        await updateAssignmentStatus(assignment._id.toString(), {
          status: "completed",
          errorMessage: null
        });

        await invalidateAssignmentCaches(assignment._id.toString());

        await emitAssignmentStatus({
          assignmentId: assignment._id.toString(),
          status: "completed",
          timestamp: new Date().toISOString(),
          message: "Question paper generated"
        });

        await pdfQueue.add("export-paper-pdf", {
          assignmentId: assignment._id.toString()
        });
      } catch (error) {
        let message = "Something went wrong while generating the paper. Please try again.";
        if (error instanceof SyntaxError) {
          message = "The AI returned an invalid response. Please try generating again.";
        } else if (error instanceof Error) {
          message = error.message;
        }
        await updateAssignmentStatus(assignment._id.toString(), {
          status: "failed",
          errorMessage: message
        });

        await emitAssignmentStatus({
          assignmentId: assignment._id.toString(),
          status: "failed",
          timestamp: new Date().toISOString(),
          errorMessage: message
        });

        throw error;
      }
    },
    {
      connection: queueConnection
    }
  );
};
