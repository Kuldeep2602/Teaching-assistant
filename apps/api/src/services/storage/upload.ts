import path from "node:path";
import multer from "multer";

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isAllowed =
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain" ||
      extension === ".pdf" ||
      extension === ".txt";

    if (!isAllowed) {
      callback(new Error("Only PDF and TXT files are supported"));
      return;
    }

    callback(null, true);
  }
});
