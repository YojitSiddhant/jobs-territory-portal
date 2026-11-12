import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPrivateObjectKey, getPrivateStorage, isPrivateObjectKey, validateUpload } from "../../src/server/storage/private-storage";

test("creates safe private keys and rejects traversal", () => {
  const key = createPrivateObjectKey("candidate-1", "resume", "My Resume.pdf");
  assert.match(key, /^private\/candidates\/candidate-1\/resume\/[a-f0-9-]+-my-resume\.pdf$/);
  assert.equal(isPrivateObjectKey(key), true);
  assert.equal(isPrivateObjectKey("private/candidates/candidate-1/resume/../../secret"), false);
});

test("validates upload MIME types and size limits", () => {
  assert.doesNotThrow(() => validateUpload(new File([new Uint8Array(4)], "resume.pdf", { type: "application/pdf" }), "resume"));
  assert.throws(() => validateUpload(new File([new Uint8Array(4)], "script.exe", { type: "application/octet-stream" }), "resume"));
  assert.throws(() => validateUpload(new File([new Uint8Array(6 * 1024 * 1024)], "photo.png", { type: "image/png" }), "profile-photo"));
});

test("local storage writes and reads privately", async () => {
  const root = await mkdtemp(join(tmpdir(), "jobs-territory-storage-"));
  const previous = { driver: process.env.STORAGE_DRIVER, root: process.env.STORAGE_LOCAL_DIR, database: process.env.DATABASE_URL, auth: process.env.AUTH_SECRET };
  process.env.STORAGE_DRIVER = "local"; process.env.STORAGE_LOCAL_DIR = root; process.env.DATABASE_URL = "mysql://test"; process.env.AUTH_SECRET = "test-only-placeholder-secret-1234567890";
  try {
    const key = "private/candidates/candidate-1/resume/file.pdf";
    const storage = getPrivateStorage();
    await storage.put({ key, contentType: "application/pdf", sizeBytes: 3, body: new Uint8Array([1, 2, 3]) });
    const result = await storage.get(key);
    assert.equal(result.contentType, "application/pdf");
    assert.deepEqual([...result.body], [1, 2, 3]);
    await storage.delete(key);
    await assert.rejects(() => storage.get(key));
  } finally {
    for (const [key, value] of [["STORAGE_DRIVER", previous.driver], ["STORAGE_LOCAL_DIR", previous.root], ["DATABASE_URL", previous.database], ["AUTH_SECRET", previous.auth]] as const) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    await rm(root, { recursive: true, force: true });
  }
});

test("local storage is the development default when no provider is configured", async () => {
  const previous = { driver: process.env.STORAGE_DRIVER, database: process.env.DATABASE_URL, auth: process.env.AUTH_SECRET };
  delete process.env.STORAGE_DRIVER; process.env.DATABASE_URL = "mysql://test"; process.env.AUTH_SECRET = "test-only-placeholder-secret-1234567890";
  try {
    assert.doesNotThrow(() => getPrivateStorage());
  } finally {
    for (const [key, value] of [["STORAGE_DRIVER", previous.driver], ["DATABASE_URL", previous.database], ["AUTH_SECRET", previous.auth]] as const) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test("cloud storage configuration is required only when production mode is selected", async () => {
  const previous = { driver: process.env.STORAGE_DRIVER, bucket: process.env.STORAGE_BUCKET, region: process.env.STORAGE_REGION, accessKey: process.env.STORAGE_ACCESS_KEY_ID, secret: process.env.STORAGE_SECRET_ACCESS_KEY, database: process.env.DATABASE_URL, auth: process.env.AUTH_SECRET };
  process.env.STORAGE_DRIVER = "s3"; delete process.env.STORAGE_BUCKET; delete process.env.STORAGE_REGION; delete process.env.STORAGE_ACCESS_KEY_ID; delete process.env.STORAGE_SECRET_ACCESS_KEY; process.env.DATABASE_URL = "mysql://test"; process.env.AUTH_SECRET = "test-only-placeholder-secret-1234567890";
  try {
    assert.throws(() => getPrivateStorage(), /not configured/i);
  } finally {
    for (const [key, value] of [["STORAGE_DRIVER", previous.driver], ["STORAGE_BUCKET", previous.bucket], ["STORAGE_REGION", previous.region], ["STORAGE_ACCESS_KEY_ID", previous.accessKey], ["STORAGE_SECRET_ACCESS_KEY", previous.secret], ["DATABASE_URL", previous.database], ["AUTH_SECRET", previous.auth]] as const) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
