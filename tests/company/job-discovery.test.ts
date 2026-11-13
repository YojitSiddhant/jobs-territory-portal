import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDiscoveryWhere, isDiscoverableJob, skillFilter, skillTermVariants } from "../../src/server/jobs/public-discovery";
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

  it("matches skills regardless of the typed casing", () => {
    assert.ok(skillTermVariants("react").includes("React"));
    assert.ok(skillTermVariants("AWS").includes("AWS"));
    assert.ok(skillTermVariants("aws").includes("AWS"));
    assert.ok(skillTermVariants("next.js").includes("Next.js"));
    assert.ok(skillTermVariants("ui/ux").includes("UI/UX"));
    assert.ok(skillTermVariants("data analysis").includes("Data analysis"));
    assert.ok(skillTermVariants("mysql").includes("MySQL"));
    assert.deepEqual(skillTermVariants("   "), []);
  });

  it("filters skills with array_contains, never string_contains (MySQL JSON regression)", () => {
    // string_contains never matches inside a JSON array on MySQL, so every
    // skill filter silently returned zero results. The filter must only use
    // array_contains against the term's case variants.
    const filter = JSON.stringify(skillFilter("React"));
    assert.ok(filter.includes("array_contains"));
    assert.ok(!filter.includes("string_contains"));

    const where = JSON.stringify(buildDiscoveryWhere(normalizeDiscoveryQuery(new URLSearchParams("q=python&skill=react")), new Date()));
    assert.ok(!where.includes("string_contains"));
    assert.ok(where.includes('"array_contains":"React"'));
    assert.ok(where.includes('"array_contains":"Python"'));
  });

  it("builds the shared discovery where clause with every filter applied", () => {
    const now = new Date();
    const query = normalizeDiscoveryQuery(new URLSearchParams("q=engineer&location=Chennai&workplaceType=REMOTE&employmentType=FULL_TIME&experience=3&skill=AWS&company=NovaByte&salaryMin=500000&salaryMax=2000000"));
    const where = buildDiscoveryWhere(query, now);
    assert.equal(where.status, "PUBLISHED");
    assert.deepEqual(where.company, { status: "APPROVED" });
    assert.deepEqual(where.location, { contains: "Chennai" });
    assert.equal(where.workplaceType, "REMOTE");
    assert.equal(where.employmentType, "FULL_TIME");
    assert.deepEqual(where.experienceRequirement, { contains: "3" });
    const and = where.AND as Record<string, unknown>[];
    assert.equal(and.length, 6); // deadline, q, company, salaryMin, salaryMax, skill
    assert.ok(JSON.stringify(and).includes('"array_contains":"AWS"'));
    assert.deepEqual(and[0], { OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: now } }] });
  });
});
