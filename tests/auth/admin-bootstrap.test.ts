import assert from "node:assert/strict";
import test from "node:test";
import { canPromoteExistingUser, normalizeAdminEmail } from "../../src/server/admin/bootstrap";

test("admin bootstrap normalizes email and requires explicit promotion", () => {
  assert.equal(normalizeAdminEmail(" Admin@Example.COM "), "admin@example.com");
  assert.equal(canPromoteExistingUser("ADMIN", false), true);
  assert.equal(canPromoteExistingUser("CANDIDATE", false), false);
  assert.equal(canPromoteExistingUser("COMPANY", true), true);
});
