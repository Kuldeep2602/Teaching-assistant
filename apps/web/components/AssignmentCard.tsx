"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AssignmentRecord } from "@veda/shared";
import { useAssignmentsStore } from "../store/assignments";

export function AssignmentCard({ assignment }: { assignment: AssignmentRecord }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const deleteAssignment = useAssignmentsStore((state) => state.deleteAssignment);
  const submitting = useAssignmentsStore((state) => state.submitting);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleDelete = async () => {
    setMenuOpen(false);
    await deleteAssignment(assignment.id);
  };

  return (
    <article className="assignment-card">
      <div className="assignment-card-head">
        <Link className="assignment-card-title" href={`/assignments/${assignment.id}`}>
          <h3>{assignment.title}</h3>
        </Link>
        <div ref={menuRef} className="card-menu-shell">
          <button
            className="card-menu-button"
            type="button"
            aria-label="Open assignment actions"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="card-menu" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
          {menuOpen ? (
            <div className="card-menu-popover">
              <Link className="card-menu-link" href={`/assignments/${assignment.id}`} onClick={() => setMenuOpen(false)}>
                View Assignment
              </Link>
              <button className="card-menu-delete" type="button" onClick={() => void handleDelete()} disabled={submitting}>
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <Link className="assignment-card-body" href={`/assignments/${assignment.id}`}>
        <div className="assignment-card-meta">
          <span>
            <strong>Assigned on :</strong> {new Date(assignment.createdAt).toLocaleDateString("en-GB")}
          </span>
          <span>
            <strong>Due :</strong> {new Date(assignment.dueDate).toLocaleDateString("en-GB")}
          </span>
        </div>
        <div className="assignment-card-footer subtle">
          <span>{assignment.subject}</span>
          <span>{assignment.className}</span>
        </div>
      </Link>
    </article>
  );
}
