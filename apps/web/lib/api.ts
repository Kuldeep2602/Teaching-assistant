import type { AssignmentInput, AssignmentRecord } from "@veda/shared";
import { API_BASE_URL } from "./config";

const handleResponse = async <T>(response: Response) => {
  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: "Request failed" }))) as {
      message?: string;
    };
    throw new Error(error.message || "Request failed");
  }

  return (await response.json()) as T;
};

export const listAssignments = async () => {
  const response = await fetch(`${API_BASE_URL}/api/assignments`, {
    cache: "no-store"
  });

  return handleResponse<AssignmentRecord[]>(response);
};

export const getAssignment = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
    cache: "no-store"
  });

  return handleResponse<AssignmentRecord>(response);
};

export const createAssignment = async (input: AssignmentInput, file?: File | null) => {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("subject", input.subject);
  formData.append("className", input.className);
  formData.append("durationMinutes", String(input.durationMinutes));
  formData.append("dueDate", input.dueDate);
  formData.append("additionalInstructions", input.additionalInstructions || "");
  formData.append("questionTypes", JSON.stringify(input.questionTypes));

  if (file) {
    formData.append("sourceFile", file);
  }

  const response = await fetch(`${API_BASE_URL}/api/assignments`, {
    method: "POST",
    body: formData
  });

  return handleResponse<AssignmentRecord>(response);
};

export const generateAssignment = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${id}/generate`, {
    method: "POST"
  });

  return handleResponse<AssignmentRecord>(response);
};

export const exportAssignmentPdf = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${id}/export-pdf`, {
    method: "POST"
  });

  return handleResponse<{ queued: boolean; pdfUrl?: string | null }>(response);
};

const makePdfFileName = (title: string) =>
  `${title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "assessment-paper"}.pdf`;

export const downloadAssignmentPdfFile = async (pdfUrl: string, title: string) => {
  const response = await fetch(`${API_BASE_URL}${pdfUrl}`);
  if (!response.ok) {
    throw new Error("Failed to download PDF");
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = makePdfFileName(title);
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
};

export const deleteAssignment = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: "Request failed" }))) as {
      message?: string;
    };
    throw new Error(error.message || "Request failed");
  }
};
