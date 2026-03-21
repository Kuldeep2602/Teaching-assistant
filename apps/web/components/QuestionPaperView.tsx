"use client";

import { DEMO_SCHOOL, type AssignmentRecord } from "@veda/shared";
import { StatusPill } from "./StatusPill";

export function QuestionPaperView({
  assignment,
  onGenerate,
  onExport,
  busy
}: {
  assignment: AssignmentRecord;
  onGenerate: () => Promise<void>;
  onExport: () => Promise<void>;
  busy: boolean;
}) {
  return (
    <div className="paper-layout">
      <div className="hero-banner exam-banner">
        <div className="exam-banner-copy">
          <p className="hero-copy">
            {assignment.generatedPaper
              ? `${assignment.title} is ready. Review the structured paper, regenerate it if needed, or download the formatted PDF.`
              : `We are preparing a structured question paper for ${assignment.subject} ${assignment.className}.`}
          </p>
          <div className="hero-actions">
            <button className="download-chip" onClick={() => void onExport()} disabled={busy || !assignment.generatedPaper}>
              <span>Download PDF</span>
            </button>
            <button className="secondary-button thin-button" onClick={() => void onGenerate()} disabled={busy}>
              <span>{busy ? "Generating..." : assignment.generatedPaper ? "Regenerate Paper" : "Generate Paper"}</span>
            </button>
            <StatusPill status={assignment.status} />
          </div>
        </div>
      </div>

      {!assignment.generatedPaper ? (
        <div className="content-surface waiting-panel exam-waiting">
          {assignment.status === "failed" ? (
            <>
              <h3>Generation could not be completed</h3>
              <p>{assignment.errorMessage || "Something went wrong. Please try generating the paper again."}</p>
              <p className="hint-text">
                Click &quot;Generate Paper&quot; above to retry.
              </p>
            </>
          ) : assignment.status === "processing" ? (
            <>
              <h3>Generating your question paper...</h3>
              <p>The AI is creating your assessment. This may take a moment.</p>
            </>
          ) : (
            <>
              <h3>Question paper is not ready yet</h3>
              <p>Your structured paper will appear here once generation is complete.</p>
            </>
          )}
        </div>
      ) : (
        <article className="exam-paper">
          <header className="exam-header">
            <h2>{DEMO_SCHOOL.schoolName}</h2>
            <p>Subject: {assignment.generatedPaper.subject}</p>
            <p>Class: {assignment.generatedPaper.className}</p>
          </header>

          <div className="exam-meta">
            <span>Time Allowed: {assignment.generatedPaper.durationMinutes} minutes</span>
            <span>Maximum Marks: {assignment.generatedPaper.totalMarks}</span>
          </div>

          <div className="paper-instructions exam-paper-intro">
            {assignment.generatedPaper.instructions.map((instruction) => (
              <p key={instruction}>{instruction}</p>
            ))}
          </div>

          <div className="student-lines student-lines-left">
            <div>Name: ____________________</div>
            <div>Roll Number: ____________________</div>
            <div>Class: {assignment.generatedPaper.className} Section: ____________________</div>
          </div>

          {assignment.generatedPaper.sections.map((section) => (
            <section key={section.id} className="paper-section">
              <div className="paper-section-head paper-section-head-centered">
                <h3>{section.title}</h3>
                <p>{section.instruction}</p>
              </div>
              <div className="question-list paper-plain-list">
                {section.questions.map((question) => (
                  <div key={question.id} className="question-item paper-question-line">
                    <div className="question-row">
                      <div className="question-copy">
                        <strong>{question.questionNumber}.</strong> {question.text}
                      </div>
                      <span className={`question-badge difficulty-${question.difficulty}`}>
                        {question.difficulty} ({question.marks} {question.marks === 1 ? "Mark" : "Marks"})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="paper-endnote">End of Question Paper</div>

          <section className="paper-section answer-section">
            <div className="paper-section-head">
              <h3>Answer Key:</h3>
            </div>
            <div className="answer-list paper-plain-list">
              {assignment.generatedPaper.answerKey.map((item) => (
                <div key={item.questionNumber} className="answer-item paper-answer-line">
                  <strong>{item.questionNumber}.</strong> {item.answer}
                  {item.explanation ? <p>{item.explanation}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </article>
      )}
    </div>
  );
}
