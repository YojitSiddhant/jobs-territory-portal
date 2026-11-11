import { getEnv } from "@/server/config/env";

export type PrivateObject = {
  key: string;
  contentType: string;
  sizeBytes: number;
};

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
