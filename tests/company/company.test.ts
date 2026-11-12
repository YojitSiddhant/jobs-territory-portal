import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertCompanyEditable, isApprovedCompanyStatus } from "../../src/server/companies/company-profile";
import { companyDocumentSchema, companyProfileSchema } from "../../src/shared/validation/company";
import { companyFromResponse } from "../../src/features/companies/api";

describe("company verification", () => {
  it("validates all required registration fields", () => {
    const result = companyProfileSchema.safeParse({
      name: "Example Labs",
      registrationNumber: "REG-123",
      website: "https://example.com",
      officialEmail: "official@example.com",
      phone: "+91 9999999999",
      address: "Example address",
      industry: "Technology",
      description: "A company description.",
    });
    assert.equal(result.success, true);
    assert.equal(companyProfileSchema.safeParse({ name: "Example Labs" }).success, false);
  });

  it("accepts only private company document references", () => {
    assert.equal(companyDocumentSchema.safeParse({ type: "REGISTRATION_CERTIFICATE", storageKey: "private/companies/company-1/company-document/file.pdf", originalName: "registration.pdf", mimeType: "application/pdf" }).success, true);
  assert.equal(companyDocumentSchema.safeParse({ type: "ADDRESS_PROOF", storageKey: "private/companies/company-1/company-document/address.pdf", originalName: "address.pdf", mimeType: "application/pdf" }).success, true);
    assert.equal(companyDocumentSchema.safeParse({ type: "OTHER", storageKey: "public/file.pdf", originalName: "file.pdf", mimeType: "application/pdf" }).success, false);
  });

  it("normalizes company profile responses from the API success envelope", () => {
    const company = { id: "company-1", name: "Example", documents: [] } as never;
    assert.equal(companyFromResponse({ data: { company } }), company);
    assert.equal(companyFromResponse({ company }), company);
    assert.throws(() => companyFromResponse({ data: {} }), /profile response was incomplete/i);
  });

  it("keeps pending profiles editable and only approved companies eligible for jobs", () => {
    assert.doesNotThrow(() => assertCompanyEditable({ status: "PENDING" }));
    assert.equal(isApprovedCompanyStatus("PENDING"), false);
    assert.equal(isApprovedCompanyStatus("APPROVED"), true);
  });
});
