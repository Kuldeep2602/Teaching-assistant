import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import type { AssignmentUpload } from "@veda/shared";
import type { Express } from "express";
import { env } from "../../config/env.js";

const makeSafeName = (fileName: string) => fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

const hasSupabaseConfig = () => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

const getSupabaseHeaders = (mimeType: string) => ({
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
  apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
  "Content-Type": mimeType,
  "x-upsert": "true"
});

const uploadToSupabase = async (file: Express.Multer.File): Promise<AssignmentUpload> => {
  const objectPath = `assignments/${Date.now()}-${makeSafeName(file.originalname)}`;
  const uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_UPLOAD_BUCKET}/${objectPath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: getSupabaseHeaders(file.mimetype),
    body: new Uint8Array(file.buffer)
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Supabase upload failed");
    throw new Error(`Supabase upload failed: ${message}`);
  }

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    provider: "supabase",
    bucket: env.SUPABASE_UPLOAD_BUCKET,
    path: objectPath,
    publicUrl: null,
    extractedText: ""
  };
};

const uploadLocally = async (file: Express.Multer.File): Promise<AssignmentUpload> => {
  await fsPromises.mkdir(env.UPLOAD_DIR, { recursive: true });
  const fileName = `${Date.now()}-${makeSafeName(file.originalname)}`;
  const destinationPath = path.resolve(env.UPLOAD_DIR, fileName);
  await fsPromises.writeFile(destinationPath, file.buffer);

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    provider: "local",
    bucket: undefined,
    path: destinationPath,
    publicUrl: null,
    extractedText: ""
  };
};

export const persistIncomingUpload = async (file: Express.Multer.File) => {
  if (hasSupabaseConfig()) {
    return uploadToSupabase(file);
  }

  return uploadLocally(file);
};

const deleteFromSupabase = async (upload: AssignmentUpload) => {
  if (!upload.bucket || !hasSupabaseConfig()) {
    return;
  }

  const deleteUrl = `${env.SUPABASE_URL}/storage/v1/object/${upload.bucket}/${upload.path}`;
  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY!
    }
  });

  if (!response.ok && response.status !== 404) {
    const message = await response.text().catch(() => "Supabase delete failed");
    throw new Error(`Supabase delete failed: ${message}`);
  }
};

const deleteLocalUpload = async (upload: AssignmentUpload) => {
  try {
    await fsPromises.unlink(upload.path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
};

export const deleteStoredUpload = async (upload?: AssignmentUpload | null) => {
  if (!upload) {
    return;
  }

  if (upload.provider === "supabase") {
    await deleteFromSupabase(upload);
    return;
  }

  if (fs.existsSync(upload.path) || path.isAbsolute(upload.path)) {
    await deleteLocalUpload(upload);
  }
};

export const readStoredUploadBuffer = async (upload: AssignmentUpload) => {
  if (upload.provider === "supabase") {
    if (!upload.bucket || !hasSupabaseConfig()) {
      throw new Error("Supabase storage is not configured for uploaded file access");
    }

    const objectUrl = `${env.SUPABASE_URL}/storage/v1/object/${upload.bucket}/${upload.path}`;
    const response = await fetch(objectUrl, {
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
        apikey: env.SUPABASE_SERVICE_ROLE_KEY!
      }
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "Supabase download failed");
      throw new Error(`Supabase download failed: ${message}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  return fsPromises.readFile(upload.path);
};
