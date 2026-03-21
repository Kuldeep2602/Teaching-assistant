import fs from "node:fs/promises";
import path from "node:path";
import pdfParse from "pdf-parse";

export const extractTextFromFile = async (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".txt") {
    return fs.readFile(filePath, "utf8");
  }

  if (extension === ".pdf") {
    const fileBuffer = await fs.readFile(filePath);
    const parsed = await pdfParse(fileBuffer);
    return parsed.text.trim();
  }

  return "";
};
