import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const cwd = process.cwd();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(currentDir, "../..");
const repoRoot = path.resolve(apiRoot, "../..");

const candidateDirectories = [...new Set([repoRoot, apiRoot, cwd])];

const loadEnvFile = (directory: string, fileName: ".env" | ".env.local", override = false) => {
  const filePath = path.resolve(directory, fileName);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override });
  }
};

candidateDirectories.forEach((directory, index) => {
  loadEnvFile(directory, ".env", index !== 0);
});

candidateDirectories.forEach((directory) => {
  loadEnvFile(directory, ".env.local", true);
});

if (!process.env.GROQ_API_KEY || !process.env.AI_PROVIDER_MODE) {
  const examplePath = candidateDirectories
    .map((directory) => path.resolve(directory, ".env.example"))
    .find((filePath) => fs.existsSync(filePath));

  if (examplePath) {
    const exampleValues = dotenv.parse(fs.readFileSync(examplePath));

    if (!process.env.GROQ_API_KEY && exampleValues.GROQ_API_KEY) {
      process.env.GROQ_API_KEY = exampleValues.GROQ_API_KEY;
    }

    if (!process.env.AI_PROVIDER_MODE && exampleValues.AI_PROVIDER_MODE) {
      process.env.AI_PROVIDER_MODE = exampleValues.AI_PROVIDER_MODE;
    }
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  PORT: z.coerce.number().optional(),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/veda_ai"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  GROQ_API_KEY: z.string().optional(),
  AI_PROVIDER_MODE: z.enum(["auto", "mock", "groq"]).default("auto"),
  UPLOAD_DIR: z.string().default(path.resolve(process.cwd(), "uploads")),
  PDF_OUTPUT_DIR: z.string().default(path.resolve(process.cwd(), "generated")),
  NEXT_PUBLIC_API_BASE_URL: z.string().default("http://localhost:4000")
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  API_PORT: process.env.API_PORT,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  REDIS_URL: process.env.REDIS_URL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  AI_PROVIDER_MODE: process.env.AI_PROVIDER_MODE,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  PDF_OUTPUT_DIR: process.env.PDF_OUTPUT_DIR,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
});

if (env.PORT && !process.env.API_PORT) {
  env.API_PORT = env.PORT;
}
