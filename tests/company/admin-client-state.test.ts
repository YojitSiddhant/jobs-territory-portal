import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adminCompanyFromResponse } from "../../src/features/admin/api";

const company = { id: "company-1", status: "PENDING", name: "Example", fields: [], documents: [], reviews: [], itemReviewHistory: [] };

describe("admin company response normalization", () => {
  it("accepts the standard nested API envelope", () => {
    assert.equal(adminCompanyFromResponse({ data: { company } }), company);
  });

  it("accepts direct and data.company response shapes", () => {
    assert.equal(adminCompanyFromResponse({ company }), company);
    assert.equal(adminCompanyFromResponse({ data: company }), company);
  });

  it("rejects malformed or missing company responses", () => {
    assert.throws(() => adminCompanyFromResponse({ data: {} }), /response was incomplete/i);
    assert.throws(() => adminCompanyFromResponse({}), /response was incomplete/i);
  });
});
