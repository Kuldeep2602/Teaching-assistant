"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { QuestionPaperView } from "../../../components/QuestionPaperView";
import { useAssignmentsStore } from "../../../store/assignments";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const assignmentId = params.id;
  const assignment = useAssignmentsStore((state) =>
    state.currentAssignment?.id === assignmentId
      ? state.currentAssignment
      : state.assignments.find((item) => item.id === assignmentId) || null
  );
  const loading = useAssignmentsStore((state) => state.loading);
  const submitting = useAssignmentsStore((state) => state.submitting);
  const error = useAssignmentsStore((state) => state.error);
  const fetchAssignment = useAssignmentsStore((state) => state.fetchAssignment);
  const generateNow = useAssignmentsStore((state) => state.generateNow);
  const exportPdf = useAssignmentsStore((state) => state.exportPdf);

  useEffect(() => {
    if (assignmentId) {
      void fetchAssignment(assignmentId);
    }
  }, [assignmentId, fetchAssignment]);

  return (
    <AppShell
      title={assignment?.title || "Assignment"}
      subtitle={assignment ? `${assignment.subject} • ${assignment.className}` : "Loading assignment..."}
      breadcrumbLabel="Assignment"
      backHref="/assignments"
    >
      {loading && !assignment ? <div className="glass-panel">Loading assignment...</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
      {assignment ? (
        <QuestionPaperView
          assignment={assignment}
          onGenerate={() => generateNow(assignment.id)}
          onExport={() => exportPdf(assignment.id)}
          busy={submitting}
        />
      ) : null}
    </AppShell>
  );
}
