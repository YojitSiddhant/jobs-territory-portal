import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { ApiRequestError, loginAdmin, loginCandidate, loginCompany } from "../../src/features/auth/api";

const originalFetch = globalThis.fetch;
const safeUser = { id: "user-1", email: "user@example.com", role: "CANDIDATE" as const };

afterEach(() => { globalThis.fetch = originalFetch; });

describe("login request contracts", () => {
  it("uses the correct endpoints and exact payloads for candidate, company, and admin", async () => {
    const calls: { url: string; body: string }[] = [];
    globalThis.fetch = async (input, init) => {
      calls.push({ url: String(input), body: String(init?.body) });
      return new Response(JSON.stringify({ data: { user: safeUser } }), { status: 200, headers: { "Content-Type": "application/json" } });
    };
    await loginCandidate("candidate@example.com", "candidate-password");
    await loginCompany("company@example.com", "company-password");
    await loginAdmin("admin@example.com", "admin-password");
    assert.deepEqual(calls, [
      { url: "/api/auth/login", body: JSON.stringify({ email: "candidate@example.com", password: "candidate-password" }) },
      { url: "/api/auth/login", body: JSON.stringify({ email: "company@example.com", password: "company-password" }) },
      { url: "/api/auth/admin/login", body: JSON.stringify({ email: "admin@example.com", password: "admin-password" }) },
    ]);
  });

  it("preserves invalid-credential and malformed-input details", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } }), { status: 401 });
    await assert.rejects(() => loginCandidate("person@example.com", "wrong"), (error: unknown) => error instanceof ApiRequestError && error.message === "Email or password is incorrect.");
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { code: "VALIDATION_ERROR", message: "Request validation failed.", issues: [{ path: ["email"], message: "Invalid email." }] } }), { status: 400 });
    await assert.rejects(() => loginCandidate("bad", ""), (error: unknown) => error instanceof ApiRequestError && error.issues?.[0]?.path?.[0] === "email");
  });
});
