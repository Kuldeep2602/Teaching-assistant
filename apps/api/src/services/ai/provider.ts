import type { AssignmentDocument } from "../../models/Assignment.js";

export type GenerationResult = {
  provider: string;
  rawText: string;
  prompt: string;
};

export interface AiProvider {
  generatePaper(input: {
    assignment: AssignmentDocument;
    prompt: string;
    extractedText?: string;
  }): Promise<GenerationResult>;
}
