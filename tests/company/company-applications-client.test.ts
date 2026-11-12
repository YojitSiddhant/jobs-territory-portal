import test from "node:test";
import assert from "node:assert/strict";
import { fetchCompanyApplications, normalizeCompanyApplication, updateApplicationStatus } from "../../src/features/companies/api";

const application = {
  id: "application-1", status: "APPLIED", coverNote: "Hello", resumeReferenceAvailable: true,
  createdAt: "2026-01-01", updatedAt: "2026-01-01",
  job: { id: "job-1", slug: "engineer", title: "Engineer", companyId: "company-1", company: { name: "Example", slug: "example" } },
  candidate: { fullName: "Candidate", headline: "Developer", location: "Pune" },
  statusHistory: [{ status: "APPLIED", createdAt: "2026-01-01", actorRole: "CANDIDATE" }],
};

test("normalizes nested application responses without losing detail", () => {
  const result = normalizeCompanyApplication({ data: { application } });
  assert.equal(result.job.title, "Engineer");
  assert.equal(result.candidate?.fullName, "Candidate");
  assert.equal(result.coverNote, "Hello");
  assert.equal(result.statusHistory.length, 1);
});

test("normalizes malformed optional fields and rejects incomplete applications", () => {
  const result = normalizeCompanyApplication({ ...application, candidate: undefined, statusHistory: undefined });
  assert.equal(result.candidate, null);
  assert.deepEqual(result.statusHistory, []);
  assert.throws(() => normalizeCompanyApplication({ id: "missing-job", status: "APPLIED" }), /incomplete/i);
});

test("application list accepts the standard data envelope", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ data: { applications: [application] } }), { status: 200 });
  try { assert.equal((await fetchCompanyApplications())[0].job.title, "Engineer"); }
  finally { globalThis.fetch = originalFetch; }
});

test("status update accepts the standard data envelope and preserves the full application", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ data: { application: { ...application, status: "SHORTLISTED" } } }), { status: 200 });
  try {
    const result = await updateApplicationStatus("application-1", "SHORTLISTED");
    assert.equal(result.status, "SHORTLISTED");
    assert.equal(result.job.title, "Engineer");
    assert.equal(result.candidate?.fullName, "Candidate");
  } finally { globalThis.fetch = originalFetch; }
});

test("unauthorized status updates surface the API error", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: "Application not found." } }), { status: 404 });
  try { await assert.rejects(() => updateApplicationStatus("other-company-app", "SHORTLISTED"), /Application not found/); }
  finally { globalThis.fetch = originalFetch; }
});
