import { startGenerationWorker } from "./workers/generationWorker.js";
import { startPdfWorker } from "./workers/pdfWorker.js";

const bootstrap = async () => {
  await startGenerationWorker();
  await startPdfWorker();
  console.log("Workers are running");
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
