export const JOB_STATUSES = [
  "draft",
  "queued",
  "processing",
  "completed",
  "failed",
  "pdf_ready"
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const SOCKET_EVENTS = {
  QUEUED: "assignment:queued",
  PROCESSING: "assignment:processing",
  COMPLETED: "assignment:completed",
  FAILED: "assignment:failed",
  PDF_READY: "assignment:pdf_ready"
} as const;

export const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Case Study Questions",
  "True/False",
  "Fill in the Blanks"
] as const;

export const DEMO_SCHOOL = {
  schoolName: "Delhi Public School, Sector-4, Bokaro",
  schoolAddress: "Bokaro Steel City",
  teacherName: "Kuldeep",
  teacherAvatarLabel: "K"
} as const;
