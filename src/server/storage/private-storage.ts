import { randomUUID } from "node:crypto";
import { getEnv } from "@/server/config/env";

export type PrivateObject = {
  key: string;
  contentType: string;
  sizeBytes: number;
};

export function createPrivateObjectKey(userId: string, kind: "profile-photo" | "resume", filename: string) {
  const safeName = filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "");
  if (!safeName) throw new Error("A valid filename is required.");
  return `private/candidates/${userId}/${kind}/${randomUUID()}-${safeName}`;
}

export function isPrivateObjectKey(key: string) {
  return /^private\/candidates\/[^/]+\/(profile-photo|resume)\/[^/]+$/.test(key);
}

export interface PrivateStorage {
  put(input: PrivateObject & { body: ReadableStream<Uint8Array> }): Promise<void>;
  delete(key: string): Promise<void>;
  createDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

/** Boundary for private resume and verification-document storage. */
export function getPrivateStorage(): PrivateStorage {
  const env = getEnv();
  throw new Error(`Private storage adapter '${env.STORAGE_DRIVER}' is not configured yet.`);
}
