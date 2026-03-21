"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { QUESTION_TYPE_OPTIONS } from "@veda/shared";
import { useRouter } from "next/navigation";
import { useAssignmentFormStore } from "../store/assignment-form";
import { useAssignmentsStore } from "../store/assignments";

function QuestionTypeDropdown({
  value,
  onChange
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={shellRef} className={`select-shell ${open ? "is-open" : ""}`}>
      <button
        className="question-type-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="question-type-value">{value}</span>
        <span className="select-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20">
            <path d="m5.8 7.8 4.2 4.4 4.2-4.4 1 1L10 14.2 4.8 8.8z" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="question-type-menu" role="listbox" aria-label="Question type options">
          {QUESTION_TYPE_OPTIONS.map((option) => (
            <button
              key={option}
              className={`question-type-option ${option === value ? "is-selected" : ""}`}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AssignmentForm() {
  const router = useRouter();
  const {
    title,
    subject,
    className,
    durationMinutes,
    dueDate,
    additionalInstructions,
    questionTypes,
    errors,
    file,
    setField,
    addQuestionType,
    updateQuestionType,
    removeQuestionType,
    validate,
    reset
  } = useAssignmentFormStore();
  const createAndGenerate = useAssignmentsStore((state) => state.createAndGenerate);
  const submitting = useAssignmentsStore((state) => state.submitting);
  const storeError = useAssignmentsStore((state) => state.error);

  const normalizePositiveValue = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return 1;
    }

    return Math.floor(parsed);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = validate();
    if (!parsed) {
      return;
    }

    try {
      const created = await createAndGenerate(parsed, file);
      reset();
      router.push(`/assignments/${created.id}`);
    } catch {
      // Store-level error messaging already captures request failures.
    }
  };

  return (
    <form className="create-page-shell" onSubmit={handleSubmit}>
      <div className="create-page-header">
        <div className="section-indicator" />
        <div className="create-page-copy">
          <h2>Create Assignment</h2>
          <p>Set up a new assignment for your students</p>
        </div>
      </div>

      <div className="progress-rail">
        <span className="progress-bar progress-bar-active" />
        <span className="progress-bar" />
      </div>

      <div className="create-card">
        <div className="section-title-block">
          <h3>Assignment Details</h3>
          <p>Basic information about your assignment</p>
        </div>

        <label className="upload-dropzone">
          <input
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={(event) => setField("file", event.target.files?.[0] || null)}
          />
          <div className="upload-icon">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 2.8 6.2 6.6l1 1 2.1-2.1v6.9h1.4V5.5l2.1 2.1 1-1zM4 13.2h12v3H4z" />
            </svg>
          </div>
          <h4>{file ? file.name : "Choose a file or drag & drop it here"}</h4>
          <p>PDF, TXT, up to 10MB</p>
          <span className="browse-button">Browse Files</span>
          <em>Upload images of your preferred document/image</em>
          {errors.file ? <small>{errors.file}</small> : null}
        </label>

        <div className="input-grid create-input-grid">
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setField("title", event.target.value)} placeholder="Quiz on Electricity" />
            {errors.title ? <small>{errors.title}</small> : null}
          </label>
          <label className="field">
            <span>Subject</span>
            <input value={subject} onChange={(event) => setField("subject", event.target.value)} placeholder="Physics" />
            {errors.subject ? <small>{errors.subject}</small> : null}
          </label>
          <label className="field">
            <span>Class</span>
            <input value={className} onChange={(event) => setField("className", event.target.value)} placeholder="Grade 12" />
            {errors.className ? <small>{errors.className}</small> : null}
          </label>
          <label className="field">
            <span>Duration</span>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) => setField("durationMinutes", event.target.value)}
              placeholder="45"
            />
            {errors.durationMinutes ? <small>{errors.durationMinutes}</small> : null}
          </label>
        </div>

        <label className="field full-width-field">
          <span>Due Date</span>
          <input type="date" value={dueDate} onChange={(event) => setField("dueDate", event.target.value)} />
          {errors.dueDate ? <small>{errors.dueDate}</small> : null}
        </label>

        <div className="question-builder">
          <div className="question-table-head">
            <span>Question Type</span>
            <span aria-hidden="true" />
            <span>No. of Questions</span>
            <span>Marks</span>
          </div>

          {questionTypes.map((row) => (
            <div key={row.id} className="question-row">
              <label className="field inline-field">
                <QuestionTypeDropdown value={row.type} onChange={(nextValue) => updateQuestionType(row.id, { type: nextValue })} />
              </label>
              <button className="row-close" type="button" onClick={() => removeQuestionType(row.id)} aria-label="Remove question type">
                ×
              </button>
              <div className="count-pill">
                <button
                  type="button"
                  onClick={() => updateQuestionType(row.id, { questionCount: Math.max(1, row.questionCount - 1) })}
                >
                  −
                </button>
                <input
                  inputMode="numeric"
                  type="number"
                  min={1}
                  value={row.questionCount}
                  onChange={(event) => updateQuestionType(row.id, { questionCount: normalizePositiveValue(event.target.value) })}
                />
                <button type="button" onClick={() => updateQuestionType(row.id, { questionCount: row.questionCount + 1 })}>
                  +
                </button>
              </div>
              <div className="count-pill">
                <button
                  type="button"
                  onClick={() => updateQuestionType(row.id, { marksPerQuestion: Math.max(1, row.marksPerQuestion - 1) })}
                >
                  −
                </button>
                <input
                  inputMode="numeric"
                  type="number"
                  min={1}
                  value={row.marksPerQuestion}
                  onChange={(event) =>
                    updateQuestionType(row.id, { marksPerQuestion: normalizePositiveValue(event.target.value) })
                  }
                />
                <button
                  type="button"
                  onClick={() => updateQuestionType(row.id, { marksPerQuestion: row.marksPerQuestion + 1 })}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <button className="add-row-link" type="button" onClick={addQuestionType}>
            <span>+</span>
            <span>Add Question Type</span>
          </button>

          <div className="totals-block">
            <span>Total Questions : {questionTypes.reduce((sum, item) => sum + item.questionCount, 0)}</span>
            <span>
              Total Marks : {questionTypes.reduce((sum, item) => sum + item.questionCount * item.marksPerQuestion, 0)}
            </span>
          </div>

          {errors.questionTypes ? <small className="row-error">{errors.questionTypes}</small> : null}
        </div>

        <label className="field full-width-field">
          <span>Additional Information (For better output)</span>
          <textarea
            value={additionalInstructions}
            onChange={(event) => setField("additionalInstructions", event.target.value)}
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            rows={4}
          />
        </label>

        {storeError ? <div className="form-error">{storeError}</div> : null}

        <div className="form-actions create-actions">
          <button className="secondary-button rounded-pill" type="button" onClick={reset}>
            <span>Previous</span>
          </button>
          <button className="primary-button rounded-pill" type="submit" disabled={submitting}>
            <span>{submitting ? "Generating..." : "Next"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
