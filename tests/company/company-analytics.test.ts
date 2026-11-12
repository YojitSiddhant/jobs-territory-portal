import test from "node:test";
import assert from "node:assert/strict";
import { countsByStatus } from "../../src/server/companies/company-analytics";

test("company analytics fills missing statuses with zero", () => {
  const statuses = ["APPLIED", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED", "WITHDRAWN"];
  assert.deepEqual(countsByStatus([{ status: "APPLIED", _count: { _all: 3 } }], statuses), {
    APPLIED: 3, REVIEWING: 0, SHORTLISTED: 0, REJECTED: 0, HIRED: 0, WITHDRAWN: 0,
  });
});
