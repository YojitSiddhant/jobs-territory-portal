import test from "node:test";
import assert from "node:assert/strict";
import { fetchJobs, normalizeJobsResponse } from "../../src/features/jobs/api";

const job = { id: "job-1", title: "Engineer" };

test("normalizes nested jobs responses", () => {
  const result = normalizeJobsResponse({ data: { jobs: [job], pagination: { page: 2, pageSize: 20, total: 21, totalPages: 2 } } });
  assert.deepEqual(result.jobs, [job]);
  assert.deepEqual(result.pagination, { page: 2, pageSize: 20, total: 21, totalPages: 2 });
});

test("normalizes direct jobs responses", () => {
  const result = normalizeJobsResponse({ jobs: [job], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 } });
  assert.equal(result.jobs[0]?.id, "job-1");
  assert.equal(result.pagination.total, 1);
});

test("returns safe defaults for malformed jobs responses", () => {
  assert.deepEqual(normalizeJobsResponse(null), { jobs: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
  assert.deepEqual(normalizeJobsResponse({ data: { jobs: null, pagination: { total: -1 } } }).pagination, { page: 1, pageSize: 20, total: 0, totalPages: 0 });
});

test("fetchJobs preserves every filter in the request and normalizes the response", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({ jobs: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }), { status: 200 });
  };
  try {
    const result = await fetchJobs({ location: "Pune", workplaceType: "REMOTE", employmentType: "FULL_TIME", skill: "TypeScript", company: "Example", salaryMin: 50000, salaryMax: 90000, page: 2, pageSize: 20, sort: "deadline" });
    const params = new URL(requestedUrl, "http://localhost").searchParams;
    assert.equal(params.get("location"), "Pune");
    assert.equal(params.get("workplaceType"), "REMOTE");
    assert.equal(params.get("employmentType"), "FULL_TIME");
    assert.equal(params.get("skill"), "TypeScript");
    assert.equal(params.get("company"), "Example");
    assert.equal(params.get("salaryMin"), "50000");
    assert.equal(params.get("salaryMax"), "90000");
    assert.equal(params.get("page"), "2");
    assert.equal(params.get("sort"), "deadline");
    assert.deepEqual(result.pagination, { page: 1, pageSize: 20, total: 0, totalPages: 0 });
  } finally { globalThis.fetch = originalFetch; }
});
