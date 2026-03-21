import type { AssignmentRecord } from "@veda/shared";
import { redis } from "../../db/redis.js";

const assignmentKey = (id: string) => `assignment:${id}`;
const assignmentListKey = "assignments:list";

export const getCachedAssignment = async (id: string) => {
  const cached = await redis.get(assignmentKey(id));
  return cached ? (JSON.parse(cached) as AssignmentRecord) : null;
};

export const cacheAssignment = async (assignment: AssignmentRecord) => {
  await redis.set(assignmentKey(assignment.id), JSON.stringify(assignment), "EX", 60);
};

export const getCachedAssignmentList = async () => {
  const cached = await redis.get(assignmentListKey);
  return cached ? (JSON.parse(cached) as AssignmentRecord[]) : null;
};

export const cacheAssignmentList = async (assignments: AssignmentRecord[]) => {
  await redis.set(assignmentListKey, JSON.stringify(assignments), "EX", 30);
};

export const invalidateAssignmentCaches = async (id?: string) => {
  const keys = [assignmentListKey];
  if (id) {
    keys.push(assignmentKey(id));
  }
  await redis.del(keys);
};
