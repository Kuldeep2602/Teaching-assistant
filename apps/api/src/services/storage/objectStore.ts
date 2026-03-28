import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import type { AssignmentUpload } from "@veda/shared";
import type { Express } from "express";
import { env } from "../../config/env.js";

const makeSafeName = (fileName: string) => fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
const getGeneratedPdfObjectPath = (assignmentId: string) => `generated/${assignmentId}.pdf`;
const getLocalGeneratedPdfPath = (assignmentId: string) => path.resolve(env.PDF_OUTPUT_DIR, `${assignmentId}.pdf`);

const hasSupabaseConfig = () => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

const getSupabaseHeaders = (mimeType: string) => ({
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
  apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
  "Content-Type": mimeType,
  "x-upsert": "true"
});

const uploadBufferToSupabase = async (bucket: string, objectPath: string, mimeType: string, buffer: Buffer) => {
  const uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: getSupabaseHeaders(mimeType),
    body: new Blob([Uint8Array.from(buffer)], { type: mimeType })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Supabase upload failed");
    throw new Error(`Supabase upload failed: ${message}`);
  }
};

const deleteSupabaseObject = async (bucket: string, objectPath: string) => {
  const deleteUrl = `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`;
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

const downloadSupabaseObject = async (bucket: string, objectPath: string) => {
  const objectUrl = `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`;
  const response = await fetch(objectUrl, {
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY!
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "Supabase download failed");
    throw new Error(`Supabase download failed: ${message}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

const uploadToSupabase = async (file: Express.Multer.File): Promise<AssignmentUpload> => {
  const objectPath = `assignments/${Date.now()}-${makeSafeName(file.originalname)}`;
  await uploadBufferToSupabase(env.SUPABASE_UPLOAD_BUCKET, objectPath, file.mimetype, file.buffer);

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

  await deleteSupabaseObject(upload.bucket, upload.path);
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

    const buffer = await downloadSupabaseObject(upload.bucket, upload.path);
    if (!buffer) {
      throw new Error("Supabase download failed: object not found");
    }

    return buffer;
  }

  return fsPromises.readFile(upload.path);
};

export const persistGeneratedPdf = async (assignmentId: string, localFilePath: string) => {
  if (hasSupabaseConfig()) {
    const pdfBuffer = await fsPromises.readFile(localFilePath);
    await uploadBufferToSupabase(
      env.SUPABASE_PDF_BUCKET!,
      getGeneratedPdfObjectPath(assignmentId),
      "application/pdf",
      pdfBuffer
    );

    await fsPromises.unlink(localFilePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  }

  return {
    publicUrl: `/api/assignments/${assignmentId}/pdf`
  };
};

export const readGeneratedPdfBuffer = async (assignmentId: string) => {
  if (hasSupabaseConfig()) {
    const buffer = await downloadSupabaseObject(env.SUPABASE_PDF_BUCKET!, getGeneratedPdfObjectPath(assignmentId));
    if (buffer) {
      return buffer;
    }
  }

  const localFilePath = getLocalGeneratedPdfPath(assignmentId);
  try {
    return await fsPromises.readFile(localFilePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

export const deleteGeneratedPdf = async (assignmentId: string) => {
  if (hasSupabaseConfig()) {
    await deleteSupabaseObject(env.SUPABASE_PDF_BUCKET!, getGeneratedPdfObjectPath(assignmentId));
  }

  await fsPromises.unlink(getLocalGeneratedPdfPath(assignmentId)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
};
