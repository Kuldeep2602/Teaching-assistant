import type { JobStatus } from "@veda/shared";

const statusMap: Record<JobStatus, string> = {
  draft: "Draft",
  queued: "Queued",
  processing: "Generating",
  completed: "Completed",
  failed: "Failed",
  pdf_ready: "PDF Ready"
};

export function StatusPill({ status }: { status: JobStatus }) {
  return <span className={`status-pill status-${status}`}>{statusMap[status]}</span>;
}
