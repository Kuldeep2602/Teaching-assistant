import path from "node:path";
import type { AssignmentUpload } from "@veda/shared";
import pdfParse from "pdf-parse";
import { readStoredUploadBuffer } from "./objectStore.js";

export const extractTextFromFile = async (upload: AssignmentUpload) => {
  const extension = path.extname(upload.originalName || upload.path).toLowerCase();
  const fileBuffer = await readStoredUploadBuffer(upload);

  if (extension === ".txt") {
    return fileBuffer.toString("utf8");
  }

  if (extension === ".pdf") {
    const parsed = await pdfParse(fileBuffer);
    return parsed.text.trim();
  }

  return "";
};
