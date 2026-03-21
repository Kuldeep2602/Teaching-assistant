"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { AssignmentCard } from "../../components/AssignmentCard";
import { useAssignmentsStore } from "../../store/assignments";

type FilterValue =
  | { kind: "all"; value: "all" }
  | { kind: "subject"; value: string }
  | { kind: "class"; value: string };

export default function AssignmentsPage() {
  const assignments = useAssignmentsStore((state) => state.assignments);
  const loading = useAssignmentsStore((state) => state.loading);
  const error = useAssignmentsStore((state) => state.error);
  const fetchAssignments = useAssignmentsStore((state) => state.fetchAssignments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterValue>({ kind: "all", value: "all" });
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (!filterOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [filterOpen]);

  const uniqueSubjects = [...new Set(assignments.map((assignment) => assignment.subject).filter(Boolean))];
  const uniqueClasses = [...new Set(assignments.map((assignment) => assignment.className).filter(Boolean))];

  const filteredAssignments = assignments.filter((assignment) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      [assignment.title, assignment.subject, assignment.className]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesFilter =
      activeFilter.kind === "all" ||
      (activeFilter.kind === "subject" && assignment.subject === activeFilter.value) ||
      (activeFilter.kind === "class" && assignment.className === activeFilter.value);

    return matchesSearch && matchesFilter;
  });

  const filterLabel =
    activeFilter.kind === "all"
      ? "Filter By"
      : activeFilter.kind === "subject"
        ? `Subject: ${activeFilter.value}`
        : `Class: ${activeFilter.value}`;

  return (
    <AppShell
      title="Assignments"
      subtitle="Manage and create assignments for your classes."
      breadcrumbLabel="Assignment"
      backHref="/home"
    >
      {loading ? <div className="content-surface state-card">Loading assignments...</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      {!loading && assignments.length === 0 ? (
        <div className="content-surface empty-state-screen">
          <div className="empty-illustration">
            <div className="empty-ring" />
            <div className="empty-sheet">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="empty-lens">
              <div className="empty-x" />
            </div>
            <div className="empty-pill" />
            <div className="empty-spark spark-left" />
            <div className="empty-spark spark-right" />
            <div className="empty-dot dot-left" />
            <div className="empty-dot dot-right" />
            <div className="empty-swoosh" />
          </div>
          <h2>No assignments yet</h2>
          <p>
            Create your first assignment to start collecting and grading student submissions. You can set
            up rubrics, define marking criteria, and let AI assist with grading.
          </p>
          <Link className="bottom-create-button" href="/assignments/new">
            <span>Create Your First Assignment</span>
          </Link>
        </div>
      ) : null}

      {assignments.length > 0 ? (
        <div className="content-surface list-surface">
          <div className="list-header-block">
            <div className="section-indicator" />
            <div>
              <h2>Assignments</h2>
              <p>Manage and create assignments for your classes.</p>
            </div>
          </div>
          <div className="list-toolbar">
            <div ref={filterRef} className="filter-shell">
              <button className="filter-chip" type="button" onClick={() => setFilterOpen((open) => !open)}>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 5h12l-4.5 5.3v3.6l-3 1.4v-5z" />
                </svg>
                {filterLabel}
              </button>
              {filterOpen ? (
                <div className="filter-menu">
                  <button
                    className={`filter-option ${activeFilter.kind === "all" ? "is-selected" : ""}`}
                    type="button"
                    onClick={() => {
                      setActiveFilter({ kind: "all", value: "all" });
                      setFilterOpen(false);
                    }}
                  >
                    All Assignments
                  </button>
                  {uniqueSubjects.map((subject) => (
                    <button
                      key={`subject-${subject}`}
                      className={`filter-option ${
                        activeFilter.kind === "subject" && activeFilter.value === subject ? "is-selected" : ""
                      }`}
                      type="button"
                      onClick={() => {
                        setActiveFilter({ kind: "subject", value: subject });
                        setFilterOpen(false);
                      }}
                    >
                      Subject: {subject}
                    </button>
                  ))}
                  {uniqueClasses.map((className) => (
                    <button
                      key={`class-${className}`}
                      className={`filter-option ${
                        activeFilter.kind === "class" && activeFilter.value === className ? "is-selected" : ""
                      }`}
                      type="button"
                      onClick={() => {
                        setActiveFilter({ kind: "class", value: className });
                        setFilterOpen(false);
                      }}
                    >
                      Class: {className}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <label className="search-shell">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M8.8 3.8a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm5.5 10.9 3 3-1 1-3-3z" />
              </svg>
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          </div>
          {filteredAssignments.length > 0 ? (
            <div className="assignment-grid">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <div className="no-results-card">
              <h3>No assignments match this search</h3>
              <p>Try clearing the search or choosing a different filter.</p>
            </div>
          )}
          <div className="floating-create-wrap">
            <Link className="floating-create-button" href="/assignments/new">
              <span>Create Assignment</span>
            </Link>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
