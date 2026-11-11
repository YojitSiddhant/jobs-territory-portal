import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "../../src/server/auth/password";
import { candidateRegistrationSchema, companyRegistrationSchema, loginSchema } from "../../src/shared/validation/auth";

describe("authentication foundation", () => {
  it("hashes passwords and rejects the original hash as a password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    assert.notEqual(hash, "correct horse battery staple");
    assert.equal(await verifyPassword("correct horse battery staple", hash), true);
    assert.equal(await verifyPassword("wrong password", hash), false);
  });

  it("validates registration and login inputs", () => {
    assert.equal(candidateRegistrationSchema.safeParse({ email: "person@example.com", password: "long enough password", fullName: "Person" }).success, true);
    assert.equal(candidateRegistrationSchema.safeParse({ email: "bad", password: "short", fullName: "" }).success, false);
    assert.equal(companyRegistrationSchema.safeParse({ email: "owner@example.com", password: "long enough password", companyName: "Example Inc", contactEmail: "contact@example.com" }).success, true);
    assert.equal(companyRegistrationSchema.safeParse({ email: "owner@example.com", password: "short", companyName: "Example Inc", contactEmail: "not-an-email" }).success, false);
    assert.equal(loginSchema.safeParse({ email: "person@example.com", password: "secret" }).success, true);
  });

  it("keeps registration roles server-owned", () => {
    const candidate = candidateRegistrationSchema.parse({ email: "person@example.com", password: "long enough password", fullName: "Person", role: "ADMIN" });
    const company = companyRegistrationSchema.parse({ email: "owner@example.com", password: "long enough password", companyName: "Example Inc", contactEmail: "contact@example.com", role: "CANDIDATE" });
    assert.equal("role" in candidate, false);
    assert.equal("role" in company, false);
  });
});
