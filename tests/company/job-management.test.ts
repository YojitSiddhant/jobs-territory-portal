import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AuthorizationError } from "../../src/server/auth/authorization";
import { assertJobTransition, isPublicJob } from "../../src/server/jobs/job-management";
import { jobCreateSchema, jobPublishSchema } from "../../src/shared/validation/job";

const validJob = {
  title: "Backend Engineer",
  description: "Build reliable services.",
  location: "Bengaluru",
  workplaceType: "HYBRID" as const,
  employmentType: "FULL_TIME" as const,
  experienceRequirement: "2+ years",
  requiredSkills: ["TypeScript", "MySQL"],
  salaryMin: 50000,
  salaryMax: 90000,
  applicationDeadline: new Date(Date.now() + 86400000),
};

describe("company job management", () => {
  it("validates job creation and publish requirements", () => {
    assert.equal(jobCreateSchema.safeParse(validJob).success, true);
    assert.equal(jobCreateSchema.safeParse({ ...validJob, workplaceType: "INVALID" }).success, false);
    assert.equal(jobPublishSchema.safeParse({ ...validJob, applicationDeadline: new Date(Date.now() - 86400000) }).success, false);
  });

  it("allows only draft publishing and published closing", () => {
    assert.doesNotThrow(() => assertJobTransition("DRAFT", "PUBLISH"));
    assert.doesNotThrow(() => assertJobTransition("PUBLISHED", "CLOSE"));
    assert.throws(() => assertJobTransition("CLOSED", "PUBLISH"), AuthorizationError);
    assert.throws(() => assertJobTransition("DRAFT", "CLOSE"), AuthorizationError);
  });

  it("exposes only published, non-expired jobs publicly", () => {
    assert.equal(isPublicJob("PUBLISHED", null), true);
    assert.equal(isPublicJob("PUBLISHED", new Date(Date.now() + 1000)), true);
    assert.equal(isPublicJob("PUBLISHED", new Date(Date.now() - 1000)), false);
    assert.equal(isPublicJob("DRAFT", null), false);
    assert.equal(isPublicJob("CLOSED", null), false);
  });
});
