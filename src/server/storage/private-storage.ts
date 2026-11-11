import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, normalize, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { getEnv } from "@/server/config/env";

export type PrivateObject = { key: string; contentType: string; sizeBytes: number };
export type PrivateDownload = { body: Uint8Array; contentType: string };

const extensionByMime: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "application/pdf": "pdf", "application/msword": "doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export function createPrivateObjectKey(userId: string, kind: "profile-photo" | "resume" | "company-document", filename: string) {
  const safeName = filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "");
  if (!safeName || safeName.includes("..")) throw new Error("A safe filename is required.");
  const ownerPath = kind === "company-document" ? "companies" : "candidates";
  return `private/${ownerPath}/${userId}/${kind}/${randomUUID()}-${safeName}`;
}

export function isPrivateObjectKey(key: string) {
  return /^private\/(candidates\/[^/]+\/(profile-photo|resume)|companies\/[^/]+\/company-document)\/[^/]+$/.test(key) && !key.includes("..") && !key.includes("\\");
}

export function extensionForMime(mime: string) { return extensionByMime[mime]; }

export function validateUpload(file: File, kind: "profile-photo" | "resume" | "company-document") {
  const maxBytes = kind === "profile-photo" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  const allowed = kind === "profile-photo" ? ["image/jpeg", "image/png", "image/webp"] : ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowed.includes(file.type) || !extensionForMime(file.type)) throw new Error("This file type is not allowed.");
  if (file.size <= 0 || file.size > maxBytes) throw new Error(`File exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit.`);
}

export interface PrivateStorage {
  put(input: PrivateObject & { body: Uint8Array }): Promise<void>;
  delete(key: string): Promise<void>;
  get(key: string): Promise<PrivateDownload>;
}

class StorageConfigurationError extends Error { status = 503; name = "STORAGE_NOT_CONFIGURED"; }

function localPath(root: string, key: string) {
  if (!isPrivateObjectKey(key)) throw new Error("Invalid private storage key.");
  const absoluteRoot = resolve(root);
  const target = resolve(join(absoluteRoot, normalize(key)));
  if (target !== absoluteRoot && !target.startsWith(`${absoluteRoot}/`)) throw new Error("Invalid private storage key.");
  return target;
}

function createLocalStorage(root: string): PrivateStorage {
  const metadataPath = (key: string) => `${localPath(root, key)}.json`;
  return {
    async put(input) {
      const path = localPath(root, input.key);
      await mkdir(resolve(path, ".."), { recursive: true });
      await writeFile(path, input.body, { flag: "wx" });
      await writeFile(metadataPath(input.key), JSON.stringify({ contentType: input.contentType, sizeBytes: input.sizeBytes }), { flag: "wx" });
    },
    async delete(key) { await Promise.all([unlink(localPath(root, key)).catch(() => undefined), unlink(metadataPath(key)).catch(() => undefined)]); },
    async get(key) {
      const metadata = JSON.parse(await readFile(metadataPath(key), "utf8")) as { contentType?: string };
      return { body: await readFile(localPath(root, key)), contentType: metadata.contentType ?? "application/octet-stream" };
    },
  };
}

export function getPrivateStorage(): PrivateStorage {
  const env = getEnv();
  if (env.STORAGE_DRIVER === "local") return createLocalStorage(env.STORAGE_LOCAL_DIR);
  if (!env.STORAGE_BUCKET || !env.STORAGE_REGION || !env.STORAGE_ACCESS_KEY_ID || !env.STORAGE_SECRET_ACCESS_KEY) throw new StorageConfigurationError("Private object storage is not configured.");
  throw new StorageConfigurationError("The configured private storage provider adapter is not installed.");
}
