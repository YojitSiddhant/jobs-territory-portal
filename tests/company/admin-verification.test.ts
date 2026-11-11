import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AuthorizationError } from "../../src/server/auth/authorization";
import { assertValidReviewTransition, hasRequiredVerificationData } from "../../src/server/admin/company-verification";
import { reviewReasonSchema } from "../../src/shared/validation/admin-company";

const company = {
  name: "Example Labs",
  registrationNumber: "REG-123",
  website: "https://example.com",
  contactEmail: "official@example.com",
  phone: "+91 9999999999",
  address: "Example address",
  industry: "Technology",
  description: "A company description.",
  documents: [{ type: "REGISTRATION_CERTIFICATE", status: "PENDING" }],
};

describe("admin company verification", () => {
  it("requires admin review reasons", () => {
    assert.equal(reviewReasonSchema.safeParse({ reason: "" }).success, false);
    assert.equal(reviewReasonSchema.safeParse({ reason: "Incomplete registration proof." }).success, true);
  });

  it("requires complete profile data and registration proof for approval", () => {
    assert.equal(hasRequiredVerificationData(company), true);
    assert.equal(hasRequiredVerificationData({ ...company, documents: [] }), false);
  });

  it("allows only valid review transitions", () => {
    assert.doesNotThrow(() => assertValidReviewTransition("PENDING", "APPROVED"));
    assert.doesNotThrow(() => assertValidReviewTransition("APPROVED", "SUSPENDED"));
    assert.doesNotThrow(() => assertValidReviewTransition("SUSPENDED", "RESTORED"));
    assert.throws(() => assertValidReviewTransition("APPROVED", "REJECTED"), AuthorizationError);
    assert.throws(() => assertValidReviewTransition("PENDING", "RESTORED"), AuthorizationError);
  });
});
