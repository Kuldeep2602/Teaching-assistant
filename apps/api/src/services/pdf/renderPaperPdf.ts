import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { GeneratedPaper } from "@veda/shared";
import { DEMO_SCHOOL } from "@veda/shared";
import { env } from "../../config/env.js";

fs.mkdirSync(env.PDF_OUTPUT_DIR, { recursive: true });

const ensurePageSpace = (document: PDFKit.PDFDocument, minimumSpace: number) => {
  const remainingHeight = document.page.height - document.page.margins.bottom - document.y;
  if (remainingHeight < minimumSpace) {
    document.addPage();
  }
};

const writeRule = (document: PDFKit.PDFDocument, color = "#d8d8d8") => {
  const x = document.page.margins.left;
  const y = document.y;
  const width = document.page.width - document.page.margins.left - document.page.margins.right;
  document
    .save()
    .lineWidth(1)
    .strokeColor(color)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()
    .restore();
  document.moveDown(0.8);
};

const toSentenceCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const formatMarks = (marks: number) => `${marks} ${marks === 1 ? "mark" : "marks"}`;

export const renderPaperPdf = async (assignmentId: string, paper: GeneratedPaper) => {
  const fileName = `${assignmentId}.pdf`;
  const outputPath = path.resolve(env.PDF_OUTPUT_DIR, fileName);

  await new Promise<void>((resolve, reject) => {
    const document = new PDFDocument({
      margin: 54,
      size: "A4",
      info: {
        Title: paper.title,
        Author: DEMO_SCHOOL.teacherName,
        Subject: `${paper.subject} Question Paper`
      }
    });
    const stream = fs.createWriteStream(outputPath);
    const contentWidth = document.page.width - document.page.margins.left - document.page.margins.right;
    const leftX = document.page.margins.left;
    const rightX = document.page.width - document.page.margins.right;

    stream.on("finish", () => resolve());
    stream.on("error", reject);
    document.on("error", reject);

    document.pipe(stream);

    document.font("Helvetica-Bold").fontSize(19).fillColor("#1f1f1f").text(DEMO_SCHOOL.schoolName, { align: "center" });
    document.moveDown(0.35);
    document.font("Helvetica-Bold").fontSize(12.5).text(`Subject: ${paper.subject}`, { align: "center" });
    document.moveDown(0.12);
    document.font("Helvetica-Bold").fontSize(12.5).text(`Class: ${paper.className}`, { align: "center" });
    document.moveDown(0.8);

    const metaY = document.y;
    document.font("Helvetica").fontSize(10.8).fillColor("#202020").text(`Time Allowed: ${paper.durationMinutes} minutes`, leftX, metaY);
    document.text(`Maximum Marks: ${paper.totalMarks}`, leftX, metaY, {
      width: contentWidth,
      align: "right"
    });
    document.y = Math.max(document.y, metaY + 14);
    document.moveDown(0.7);

    paper.instructions.forEach((instruction, index) => {
      document.font(index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(10.5).fillColor("#202020").text(instruction);
      document.moveDown(0.15);
    });

    document.moveDown(0.55);
    document.font("Helvetica").fontSize(10.8).fillColor("#202020").text("Name: ____________________", leftX);
    document.text("Roll Number: ____________________", leftX);
    document.text(`Class: ${paper.className} Section: ____________________`, leftX);
    document.moveDown(0.7);
    writeRule(document);

    paper.sections.forEach((section) => {
      ensurePageSpace(document, 110);
      document.font("Helvetica-Bold").fontSize(14).fillColor("#1f1f1f").text(section.title, {
        align: "center"
      });
      document.moveDown(0.2);
      document.font("Helvetica-Oblique").fontSize(10).fillColor("#5a5a5a").text(section.instruction, {
        align: "center"
      });
      document.moveDown(0.7);

      section.questions.forEach((question) => {
        const questionText = `${question.questionNumber}. ${question.text}`;
        const metaText = `${toSentenceCase(question.difficulty)} (${formatMarks(question.marks)})`;
        const questionWidth = contentWidth - 18;

        document.font("Helvetica").fontSize(10.8);
        const questionHeight = document.heightOfString(questionText, {
          width: questionWidth,
          align: "left",
          lineGap: 2
        });
        document.font("Helvetica-Bold").fontSize(9.4);
        const metaHeight = document.heightOfString(metaText, {
          width: questionWidth
        });

        ensurePageSpace(document, questionHeight + metaHeight + 20);

        document
          .font("Helvetica")
          .fontSize(10.8)
          .fillColor("#202020")
          .text(questionText, leftX, document.y, {
            width: questionWidth,
            align: "left",
            lineGap: 2
          });
        document.moveDown(0.18);
        document
          .font("Helvetica-Bold")
          .fontSize(9.4)
          .fillColor("#4a5563")
          .text(metaText, leftX + 18, document.y, {
            width: questionWidth - 18,
            align: "right"
          });
        document.fillColor("#202020");
        document.moveDown(0.62);
      });

      document.moveDown(0.45);
    });

    ensurePageSpace(document, 80);
    document.moveDown(0.2);
    document.font("Helvetica-Bold").fontSize(10.8).fillColor("#202020").text("End of Question Paper");
    document.addPage();

    document.font("Helvetica-Bold").fontSize(16).fillColor("#1f1f1f").text("Answer Key");
    document.moveDown(0.8);
    paper.answerKey.forEach((item) => {
      ensurePageSpace(document, item.explanation ? 56 : 36);
      document.font("Helvetica-Bold").fontSize(10.8).fillColor("#202020").text(`${item.questionNumber}. ${item.answer}`);
      if (item.explanation) {
        document
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#5e6977")
          .text(item.explanation, leftX + 16, document.y + 2, {
            width: contentWidth - 16,
            lineGap: 2
          });
        document.fillColor("#202020");
      }
      document.moveDown(0.65);
    });

    document.end();
  });

  return {
    outputPath
  };
};
