import test from "node:test";
import assert from "node:assert/strict";
import { hasUsableCandidateProfile, isApplyableJob, assertApplicationTransition } from "../../src/server/applications/application-management";

test("requires a full name and resume reference", () => {
  assert.equal(hasUsableCandidateProfile({ fullName: "Candidate", resumeKey: "private/resume.pdf" }), true);
  assert.equal(hasUsableCandidateProfile({ fullName: "Candidate", resumeKey: null }), false);
});

test("only published, approved, non-expired jobs accept applications", () => {
  assert.equal(isApplyableJob({ status: "PUBLISHED", companyStatus: "APPROVED", applicationDeadline: null }), true);
  assert.equal(isApplyableJob({ status: "CLOSED", companyStatus: "APPROVED", applicationDeadline: null }), false);
  assert.equal(isApplyableJob({ status: "PUBLISHED", companyStatus: "SUSPENDED", applicationDeadline: null }), false);
  assert.equal(isApplyableJob({ status: "PUBLISHED", companyStatus: "APPROVED", applicationDeadline: new Date("2020-01-01") }), false);
});

test("validates company status transitions", () => {
  assert.doesNotThrow(() => assertApplicationTransition("APPLIED", "REVIEWING"));
  assert.throws(() => assertApplicationTransition("HIRED", "REJECTED"));
  assert.throws(() => assertApplicationTransition("APPLIED", "HIRED"));
});
