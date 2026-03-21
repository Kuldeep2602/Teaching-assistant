import type { GeneratedPaper } from "@veda/shared";
import { DEMO_SCHOOL } from "@veda/shared";

export const renderPaperHtml = (paper: GeneratedPaper) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${paper.title}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; padding: 32px; }
      h1, h2, h3, p { margin: 0; }
      .header { text-align: center; margin-bottom: 24px; }
      .meta { display: flex; justify-content: space-between; margin: 16px 0; font-size: 14px; }
      .student { margin: 20px 0; line-height: 1.8; }
      .section { margin-top: 28px; }
      .question { margin: 12px 0; }
      .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f3f4f6; font-size: 12px; }
      .answer-key { margin-top: 36px; page-break-before: always; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${DEMO_SCHOOL.schoolName}</h1>
      <p>Subject: ${paper.subject}</p>
      <p>Class: ${paper.className}</p>
    </div>
    <div class="meta">
      <span>Time Allowed: ${paper.durationMinutes} minutes</span>
      <span>Maximum Marks: ${paper.totalMarks}</span>
    </div>
    <div class="student">
      <div>Name: ____________________</div>
      <div>Roll Number: ____________________</div>
      <div>Section: ____________________</div>
    </div>
    ${paper.instructions.map((instruction) => `<p>${instruction}</p>`).join("")}
    ${paper.sections
      .map(
        (section) => `
          <section class="section">
            <h2>${section.title}</h2>
            <p>${section.instruction}</p>
            ${section.questions
              .map(
                (question) => `
                  <div class="question">
                    <strong>${question.questionNumber}.</strong>
                    ${question.text}
                    <span class="tag">${question.difficulty}</span>
                    <span>[${question.marks} Marks]</span>
                  </div>
                `
              )
              .join("")}
          </section>
        `
      )
      .join("")}
    <section class="answer-key">
      <h2>Answer Key</h2>
      ${paper.answerKey
        .map(
          (item) => `
            <div class="question">
              <strong>${item.questionNumber}.</strong> ${item.answer}
              <p>${item.explanation}</p>
            </div>
          `
        )
        .join("")}
    </section>
  </body>
</html>
`;
