import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..", "..");
const nextDir = path.resolve(webRoot, ".next");
const nextCliCandidates = [
  path.resolve(webRoot, "node_modules", "next", "dist", "bin", "next"),
  path.resolve(repoRoot, "node_modules", "next", "dist", "bin", "next")
];
const nextCli = nextCliCandidates.find((candidate) => fs.existsSync(candidate));

if (!nextCli) {
  throw new Error("Could not locate Next CLI in node_modules. Run npm install before starting the web app.");
}

if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
  } catch (error) {
    console.warn("Could not clear apps/web/.next before startup:", error.message);
  }
}

const child = spawn(process.execPath, [nextCli, "dev"], {
  cwd: webRoot,
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
