"use client";

import Link from "next/link";
import { DEMO_SCHOOL } from "@veda/shared";

const toolkitTemplate = `# VedaAI Assessment Prompt Template

## Objective
Create a structured assessment paper for classroom use.

## Input Checklist
- Subject:
- Grade/Class:
- Duration in minutes:
- Due date:
- Question types with counts and marks:
- Additional instructions:
- Source notes or chapter summary:

## Output Rules
1. Organize the paper into sections such as Section A, Section B, and Section C.
2. Every question must include:
   - question text
   - difficulty level
   - marks
3. Return a separate answer key.
4. Keep the tone exam-ready and student-facing.
5. Do not return unstructured prose or meta commentary.

## Recommended Section Pattern
- Section A: objective or short-response questions
- Section B: descriptive or application questions
- Section C: challenge, case-study, or diagram-based questions

## Quality Checks
- Marks should add up correctly.
- Difficulty should feel balanced.
- Avoid repeated wording.
- Prefer syllabus-grounded questions.

## Final Notes
Use this template before generating the final JSON contract for the paper renderer.
`;

const downloadToolkitTemplate = () => {
  const blob = new Blob([toolkitTemplate], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "veda-ai-assessment-template.md";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export function HomeWorkspace() {
  const focusItems = [
    { title: "Assignments", detail: "Open the live assignment workspace and track progress." },
    { title: "Groups", detail: "Review your classes and decide where the next paper should go." },
    { title: "Toolkit", detail: "Use prompt templates when you need a faster AI workflow." }
  ];

  const quickSummary = [
    { label: "Active Assignments", value: "12" },
    { label: "Pending Reviews", value: "08" },
    { label: "Classes Managed", value: "05" }
  ];

  return (
    <div className="workspace-stack">
      <section className="content-surface workspace-hero-card">
        <div className="workspace-hero-copy">
          <span className="workspace-kicker">Teacher Dashboard</span>
          <h2>Welcome back, {DEMO_SCHOOL.teacherName}</h2>
          <p>
            Keep the workspace focused on the essentials: create assessments, manage classes, and move
            quickly into AI-assisted paper.
          </p>
          
          <br></br>
          {/* <div className="workspace-chip-row">
            {quickSummary.map((item) => (
              <span key={item.label} className="workspace-chip">
                {item.value} {item.label}
              </span>
            ))}
          </div> */}
        </div>
        <div className="workspace-hero-actions">
          <Link className="secondary-button rounded-pill" href="/assignments">
            <span>Open Assignments</span>
          </Link>
          <Link className="primary-button rounded-pill" href="/assignments/new">
            <span>Create New</span>
          </Link>
        </div>
      </section>

      <div className="workspace-grid workspace-grid-two">
        <section className="content-surface workspace-card">
          <div className="workspace-card-head">
            <div>
              <h3>Quick Start</h3>
              <p>The three areas that matter most in this build</p>
            </div>
          </div>
          <div className="workspace-list">
            {focusItems.map((item, index) => (
              <div key={item.title} className="workspace-list-row">
                <span className="workspace-dot-marker">{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-surface workspace-card">
          <div className="workspace-card-head">
            <div>
              <h3>Workspace Notes</h3>
              <p>What this home screen is for</p>
            </div>
          </div>
          <div className="workspace-note-block">
            <p>This page if for you to make notes , build todos .  </p>
            <p>   Me doing this to get extra points</p>
            </div>
        </section>
      </div>
    </div>
  );
}

export function GroupsWorkspace() {
  const groups = [
    { name: "Grade 12 Physics", meta: "48 students • 3 active papers", progress: 82 },
    { name: "Grade 8 Science", meta: "36 students • Lab worksheet running", progress: 68 },
    { name: "Grade 5 English", meta: "42 students • Reading cycle", progress: 91 },
    { name: "Grade 6 Maths", meta: "39 students • Fraction drills", progress: 74 }
  ];

  return (
    <div className="workspace-stack">
      <section className="content-surface workspace-hero-card">
        <div className="workspace-hero-copy">
          <span className="workspace-kicker">Class Groups</span>
          <h2>Manage every teaching group from one place</h2>
          <p>See which classes are active, who needs intervention, and where your next assignment should land.</p>
        </div>
      </section>

      <div className="workspace-group-grid">
        {groups.map((group) => (
          <section key={group.name} className="content-surface workspace-card workspace-group-card">
            <div className="workspace-card-head">
              <div>
                <h3>{group.name}</h3>
                <p>{group.meta}</p>
              </div>
              <span className="workspace-chip workspace-chip-soft">Live</span>
            </div>
            <div className="workspace-progress">
              <div className="workspace-progress-bar">
                <span style={{ width: `${group.progress}%` }} />
              </div>
              <strong>{group.progress}% engaged</strong>
            </div>
            <div className="workspace-chip-row">
              <span className="workspace-chip">Assignments</span>
              <span className="workspace-chip">Leaderboard</span>
              <span className="workspace-chip">Parent Summary</span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function ToolkitWorkspace() {
  const tools = [
    { title: "Rubric Builder", detail: "Create level-based scoring rubrics for short and long answers." },
    { title: "Question Variants", detail: "Generate easier and harder versions of the same assessment." },
    { title: "Worksheet Composer", detail: "Bundle multiple sections into practice sheets quickly." }
  ];

  return (
    <div className="workspace-stack">
      <section className="content-surface workspace-card workspace-card-dark">
        <div className="workspace-card-head">
          <div>
            <span className="workspace-kicker">AI Teacher&apos;s Toolkit</span>
            <h3>Reusable AI workflows for classroom prep</h3>
            <p>Prototype prompt flows, generate classroom assets, and standardize your assessment process.</p>
          </div>
          <button className="download-chip" type="button" onClick={downloadToolkitTemplate}>
            <span>Download Template</span>
          </button>
        </div>
      </section>

      <div className="workspace-grid workspace-grid-two">
        <section className="content-surface workspace-card">
          <div className="workspace-card-head">
            <div>
              <h3>Toolkit Modules</h3>
              <p>Prebuilt helpers for common teaching tasks</p>
            </div>
          </div>
          <div className="workspace-list">
            {tools.map((tool) => (
              <div key={tool.title} className="workspace-list-row">
                <div>
                  <strong>{tool.title}</strong>
                  <p>{tool.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-surface workspace-card">
          <div className="workspace-card-head">
            <div>
              <h3>Template Preview</h3>
              <p>The downloadable markdown file is based on this structure</p>
            </div>
          </div>
          <pre className="workspace-template-preview">{toolkitTemplate}</pre>
        </section>
      </div>
    </div>
  );
}

export function LibraryWorkspace() {
  const collections = [
    { title: "Assessment Templates", count: "18 files", tone: "Warm" },
    { title: "Reference Sheets", count: "11 files", tone: "Calm" },
    { title: "Past Question Banks", count: "26 files", tone: "Strong" }
  ];

  const recentFiles = [
    "Electrostatics Revision Notes.pdf",
    "Grade 5 Reading Rubric.docx",
    "Fractions Exit Ticket.txt",
    "Periodic Table Practice Sheet.pdf"
  ];

  return (
    <div className="workspace-stack">
      <section className="content-surface workspace-hero-card">
        <div className="workspace-hero-copy">
          <span className="workspace-kicker">My Library</span>
          <h2>Your reusable teaching assets</h2>
          <p>Keep question banks, rubrics, notes, and templates organized for faster assignment creation.</p>
        </div>
      </section>

      <div className="workspace-library-strip">
        {collections.map((collection) => (
          <section key={collection.title} className={`content-surface workspace-card workspace-collection-card tone-${collection.tone.toLowerCase()}`}>
            <h3>{collection.title}</h3>
            <p>{collection.count}</p>
          </section>
        ))}
      </div>

      <section className="content-surface workspace-card">
        <div className="workspace-card-head">
          <div>
            <h3>Recently Opened</h3>
            <p>Quick access to your last-used classroom resources</p>
          </div>
        </div>
        <div className="workspace-list">
          {recentFiles.map((file) => (
            <div key={file} className="workspace-list-row workspace-split-row">
              <strong>{file}</strong>
              <span className="workspace-chip workspace-chip-soft">Open</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SettingsWorkspace() {
  const preferences = [
    "Enable generation progress notifications",
    "Auto-export PDF after successful paper generation",
    "Highlight difficult questions in preview mode"
  ];

  return (
    <div className="workspace-stack">
      <section className="content-surface workspace-card">
        <div className="workspace-card-head">
          <div>
            <span className="workspace-kicker">Settings</span>
            <h3>{DEMO_SCHOOL.schoolName}</h3>
            <p>Configure profile preferences, AI defaults, and your school identity.</p>
          </div>
          <span className="workspace-chip workspace-chip-soft">School Admin View</span>
        </div>
      </section>

      <div className="workspace-grid workspace-grid-two">
        <section className="content-surface workspace-card">
          <div className="workspace-card-head">
            <div>
              <h3>Profile</h3>
              <p>Account information used in the workspace</p>
            </div>
          </div>
          <div className="workspace-form-preview">
            <div className="workspace-preview-field">
              <span>Teacher Name</span>
              <strong>{DEMO_SCHOOL.teacherName}</strong>
            </div>
            <div className="workspace-preview-field">
              <span>School</span>
              <strong>{DEMO_SCHOOL.schoolName}</strong>
            </div>
            <div className="workspace-preview-field">
              <span>Location</span>
              <strong>{DEMO_SCHOOL.schoolAddress}</strong>
            </div>
          </div>
        </section>

        <section className="content-surface workspace-card">
          <div className="workspace-card-head">
            <div>
              <h3>Preferences</h3>
              <p>Workspace defaults for everyday use</p>
            </div>
          </div>
          <div className="workspace-list">
            {preferences.map((item) => (
              <div key={item} className="workspace-toggle-row">
                <span>{item}</span>
                <span className="workspace-toggle is-on" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
