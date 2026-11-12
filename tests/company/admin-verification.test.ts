import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AuthorizationError } from "../../src/server/auth/authorization";
import { assertValidReviewTransition, canApproveCompany, currentFieldReview, hasRequiredVerificationData } from "../../src/server/admin/company-verification";
import { reviewReasonSchema } from "../../src/shared/validation/admin-company";

const companyData = {
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
    assert.equal(hasRequiredVerificationData(companyData), true);
    assert.equal(hasRequiredVerificationData({ ...companyData, documents: [] }), false);
  });

  it("allows only valid review transitions", () => {
    assert.doesNotThrow(() => assertValidReviewTransition("PENDING", "APPROVED"));
    assert.doesNotThrow(() => assertValidReviewTransition("APPROVED", "SUSPENDED"));
    assert.doesNotThrow(() => assertValidReviewTransition("SUSPENDED", "RESTORED"));
    assert.throws(() => assertValidReviewTransition("APPROVED", "REJECTED"), AuthorizationError);
    assert.throws(() => assertValidReviewTransition("PENDING", "RESTORED"), AuthorizationError);
  });

  it("keeps newly submitted fields and documents pending until individually reviewed", () => {
    const company = { ...companyData, updatedAt: new Date("2026-01-01"), itemReviews: [], documents: [{ type: "REGISTRATION_CERTIFICATE", status: "PENDING", itemReviews: [] }] } as never;
    assert.equal(currentFieldReview(company, "NAME").status, "PENDING");
    assert.equal(canApproveCompany(company), false);
  });

  it("requires every field and every document to be verified before approval", () => {
    const fields = ["NAME", "REGISTRATION_NUMBER", "WEBSITE", "CONTACT_EMAIL", "PHONE", "ADDRESS", "INDUSTRY", "DESCRIPTION"].map((field) => ({ field, decision: "VERIFIED", createdAt: new Date("2026-01-02"), reason: null, reviewer: { id: "admin", email: "admin@example.com" } }));
    const company = { ...companyData, updatedAt: new Date("2026-01-01"), itemReviews: fields, documents: [{ type: "REGISTRATION_CERTIFICATE", status: "VERIFIED", itemReviews: [{ decision: "VERIFIED", createdAt: new Date("2026-01-02") }] }] } as never;
    assert.equal(canApproveCompany(company), true);
    const rejectedCompany = { ...companyData, updatedAt: new Date("2026-01-01"), itemReviews: fields, documents: [{ type: "REGISTRATION_CERTIFICATE", status: "REJECTED", itemReviews: [{ decision: "REJECTED", createdAt: new Date("2026-01-02") }] }] } as never;
    assert.equal(canApproveCompany(rejectedCompany), false);
  });
});
