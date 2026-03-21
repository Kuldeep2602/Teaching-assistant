import mongoose, { Schema } from "mongoose";

const generatedPaperSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      unique: true
    },
    provider: { type: String, required: true },
    prompt: { type: String, required: true },
    paper: { type: Schema.Types.Mixed, required: true }
  },
  {
    timestamps: true
  }
);

export type GeneratedPaperDocument = mongoose.InferSchemaType<typeof generatedPaperSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GeneratedPaperModel =
  mongoose.models.GeneratedPaper || mongoose.model("GeneratedPaper", generatedPaperSchema);
