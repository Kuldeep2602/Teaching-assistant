import mongoose, { Schema } from "mongoose";

const questionTypeConfigSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    questionCount: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true }
  },
  { _id: false }
);

const assignmentUploadSchema = new Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    provider: { type: String, enum: ["local", "supabase"], required: true, default: "local" },
    bucket: { type: String, default: null },
    path: { type: String, required: true },
    publicUrl: { type: String, default: null },
    extractedText: { type: String, default: "" }
  },
  { _id: false }
);

const assignmentSchema = new Schema(
  {
    ownerId: { type: String, required: true, default: "demo-teacher" },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    dueDate: { type: String, required: true },
    additionalInstructions: { type: String, default: "" },
    questionTypes: { type: [questionTypeConfigSchema], required: true },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "queued", "processing", "completed", "failed", "pdf_ready"],
      default: "draft"
    },
    pdfUrl: { type: String, default: null },
    errorMessage: { type: String, default: null },
    upload: { type: assignmentUploadSchema, default: null }
  },
  {
    timestamps: true
  }
);

export type AssignmentDocument = mongoose.InferSchemaType<typeof assignmentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AssignmentModel =
  mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
