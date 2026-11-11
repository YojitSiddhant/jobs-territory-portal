import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "../../src/server/auth/password";
import { candidateRegistrationSchema, loginSchema } from "../../src/shared/validation/auth";

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
    assert.equal(loginSchema.safeParse({ email: "person@example.com", password: "secret" }).success, true);
  });
});
