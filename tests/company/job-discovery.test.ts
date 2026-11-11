import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDiscoverableJob } from "../../src/server/jobs/public-discovery";
import { jobDiscoveryQuerySchema, normalizeDiscoveryQuery } from "../../src/shared/validation/job-discovery";

describe("candidate job discovery", () => {
  it("hides drafts, closed jobs, expired jobs, and unapproved companies", () => {
    assert.equal(isDiscoverableJob("PUBLISHED", "APPROVED", null), true);
    assert.equal(isDiscoverableJob("PUBLISHED", "APPROVED", new Date(Date.now() - 1000)), false);
    assert.equal(isDiscoverableJob("DRAFT", "APPROVED", null), false);
    assert.equal(isDiscoverableJob("CLOSED", "APPROVED", null), false);
    assert.equal(isDiscoverableJob("PUBLISHED", "SUSPENDED", null), false);
  });

  it("normalizes search, filters, pagination, and sorting safely", () => {
    const query = normalizeDiscoveryQuery(new URLSearchParams("q=%20TypeScript%20&location=Remote&page=2&pageSize=50&sort=deadline&salaryMin=50000&salaryMax=90000"));
    assert.equal(query.q, "TypeScript");
    assert.equal(query.page, 2);
    assert.equal(query.pageSize, 50);
    assert.equal(query.sort, "deadline");
    assert.equal(query.salaryMin, 50000);
    assert.equal(jobDiscoveryQuerySchema.safeParse({ pageSize: 51 }).success, false);
    assert.equal(jobDiscoveryQuerySchema.safeParse({ salaryMin: 90000, salaryMax: 50000 }).success, false);
  });
});
