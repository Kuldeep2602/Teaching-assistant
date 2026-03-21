"use client";

import { create } from "zustand";
import type { AssignmentInput, AssignmentRecord, SocketEventPayload } from "@veda/shared";
import {
  createAssignment as createAssignmentRequest,
  deleteAssignment as deleteAssignmentRequest,
  downloadAssignmentPdfFile,
  exportAssignmentPdf,
  generateAssignment,
  getAssignment,
  listAssignments
} from "../lib/api";

type AssignmentsState = {
  assignments: AssignmentRecord[];
  currentAssignment: AssignmentRecord | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pendingPdfDownloadId: string | null;
  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAndGenerate: (input: AssignmentInput, file?: File | null) => Promise<AssignmentRecord>;
  generateNow: (id: string) => Promise<void>;
  exportPdf: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  applySocketEvent: (event: SocketEventPayload) => void;
};

const mergeAssignment = (
  assignments: AssignmentRecord[],
  assignmentId: string,
  patch: Partial<AssignmentRecord>
) => assignments.map((assignment) => (assignment.id === assignmentId ? { ...assignment, ...patch } : assignment));

export const useAssignmentsStore = create<AssignmentsState>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  loading: false,
  submitting: false,
  error: null,
  pendingPdfDownloadId: null,
  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const assignments = await listAssignments();
      set({ assignments, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load assignments", loading: false });
    }
  },
  fetchAssignment: async (id) => {
    set({ loading: true, error: null });
    try {
      const assignment = await getAssignment(id);
      const shouldDownload = get().pendingPdfDownloadId === assignment.id && !!assignment.pdfUrl;
      if (shouldDownload && assignment.pdfUrl) {
        await downloadAssignmentPdfFile(assignment.pdfUrl, assignment.title);
      }
      set((state) => ({
        currentAssignment: assignment,
        assignments: state.assignments.some((item) => item.id === assignment.id)
          ? mergeAssignment(state.assignments, assignment.id, assignment)
          : [assignment, ...state.assignments],
        loading: false,
        pendingPdfDownloadId: shouldDownload ? null : state.pendingPdfDownloadId
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load assignment", loading: false });
    }
  },
  createAndGenerate: async (input, file) => {
    set({ submitting: true, error: null });
    try {
      const created = await createAssignmentRequest(input, file);
      const queued = await generateAssignment(created.id);
      set((state) => ({
        assignments: [queued, ...state.assignments],
        currentAssignment: queued,
        submitting: false
      }));
      return queued;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create assignment";
      set({ error: message, submitting: false });
      throw error;
    }
  },
  generateNow: async (id) => {
    set({ submitting: true, error: null });
    try {
      const queued = await generateAssignment(id);
      set((state) => ({
        assignments: mergeAssignment(state.assignments, id, queued),
        currentAssignment: state.currentAssignment?.id === id ? queued : state.currentAssignment,
        submitting: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to queue generation", submitting: false });
    }
  },
  exportPdf: async (id) => {
    set({ submitting: true, error: null });
    try {
      const state = get();
      const assignment =
        state.currentAssignment?.id === id
          ? state.currentAssignment
          : state.assignments.find((item) => item.id === id) || null;

      if (assignment?.pdfUrl) {
        await downloadAssignmentPdfFile(assignment.pdfUrl, assignment.title);
        set({ submitting: false });
        return;
      }

      const result = await exportAssignmentPdf(id);

      if (result.pdfUrl && assignment) {
        await downloadAssignmentPdfFile(result.pdfUrl, assignment.title);
        set({ submitting: false });
        return;
      }

      set({ submitting: false, pendingPdfDownloadId: id });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to export PDF", submitting: false });
    }
  },
  deleteAssignment: async (id) => {
    set({ submitting: true, error: null });
    try {
      await deleteAssignmentRequest(id);
      set((state) => ({
        assignments: state.assignments.filter((assignment) => assignment.id !== id),
        currentAssignment: state.currentAssignment?.id === id ? null : state.currentAssignment,
        submitting: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to delete assignment", submitting: false });
    }
  },
  applySocketEvent: (event) => {
    set((state) => ({
      assignments: mergeAssignment(state.assignments, event.assignmentId, {
        status: event.status,
        errorMessage: event.errorMessage || null,
        pdfUrl: event.pdfUrl || state.assignments.find((item) => item.id === event.assignmentId)?.pdfUrl || null
      }),
      currentAssignment:
        state.currentAssignment?.id === event.assignmentId
          ? {
              ...state.currentAssignment,
              status: event.status,
              errorMessage: event.errorMessage || null,
              pdfUrl: event.pdfUrl || state.currentAssignment.pdfUrl
            }
          : state.currentAssignment
    }));

    const shouldRefresh = event.status === "completed" || event.status === "pdf_ready";
    if (shouldRefresh) {
      void get().fetchAssignment(event.assignmentId);
    }
  }
}));
