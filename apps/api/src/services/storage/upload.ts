import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../../config/env.js";

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, env.UPLOAD_DIR);
  },
  filename: (_request, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    callback(null, `${Date.now()}-${safeName}`);
  }
});

export const uploadMiddleware = multer({
  storage,
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
