import type { CompanyProfile, CompanyJob, CompanyApplication, JobFormInput } from "./types";

export function companyFromResponse(value: unknown): CompanyProfile {
  const data = value as { data?: { company?: CompanyProfile }; company?: CompanyProfile } | null;
  const company = data?.data?.company ?? data?.company;
  if (!company) throw new Error("The company profile response was incomplete.");
  return company;
}

// ── Company profile ──────────────────────────────────────────────────────────

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  const res = await fetch("/api/company/profile");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load company profile.");
  return companyFromResponse(data);
}

export async function createCompanyProfile(input: {
  name: string; registrationNumber: string; website: string; officialEmail: string;
  phone: string; address: string; industry: string; description: string;
}): Promise<CompanyProfile> {
  const res = await fetch("/api/company/profile", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create company profile.");
  return companyFromResponse(data);
}

export async function updateCompanyProfile(input: Partial<{
  name: string; registrationNumber: string; website: string; officialEmail: string;
  phone: string; address: string; industry: string; description: string;
}>): Promise<CompanyProfile> {
  const res = await fetch("/api/company/profile", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update company profile.");
  return companyFromResponse(data);
}

export async function submitCompanyForReview(): Promise<CompanyProfile> {
  const res = await fetch("/api/company/profile/submit", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to submit for review.");
  return companyFromResponse(data);
}

export async function removeCompanyDocument(documentId: string) {
  const res = await fetch(`/api/company/profile/documents/${encodeURIComponent(documentId)}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to remove document.");
}

export async function uploadCompanyDocument(type: string, file: File): Promise<{ id: string; type: string; status: string; originalName: string; mimeType: string }> {
  const form = new FormData(); form.set("type", type); form.set("file", file);
  const res = await fetch("/api/company/profile/documents/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to upload document.");
  return data.data?.document ?? data.document;
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export function companyJobFromResponse(value: unknown): CompanyJob {
  const root = value as { data?: unknown; job?: unknown } | null;
  const nested = root?.data as { job?: unknown } | null | undefined;
  const job = nested?.job ?? root?.job ?? (root?.data && typeof root.data === "object" && "id" in root.data ? root.data : undefined);
  if (!job || typeof job !== "object" || !("id" in job) || !("status" in job)) throw new Error("The job response was incomplete.");
  return job as CompanyJob;
}

export async function fetchCompanyJobs(): Promise<CompanyJob[]> {
  const res = await fetch("/api/company/jobs");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load jobs.");
  return Array.isArray(data.data?.jobs ?? data.jobs) ? (data.data?.jobs ?? data.jobs).map(toSafeJob) : [];
}

export async function fetchCompanyJob(jobId: string): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load job.");
  return companyJobFromResponse(data);
}

export async function createJob(input: JobFormInput): Promise<CompanyJob> {
  const res = await fetch("/api/company/jobs", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create job.");
  return companyJobFromResponse(data);
}

export async function updateJob(jobId: string, input: Partial<JobFormInput>): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update job.");
  return companyJobFromResponse(data);
}

export async function publishJob(jobId: string): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}/publish`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to publish job.");
  return companyJobFromResponse(data);
}

export async function closeJob(jobId: string): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}/close`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to close job.");
  return companyJobFromResponse(data);
}

function toSafeJob(value: unknown): CompanyJob {
  const job = (value && typeof value === "object" && "job" in value) ? companyJobFromResponse(value) : value as CompanyJob;
  if (!job || typeof job !== "object" || !("id" in job) || !("status" in job)) throw new Error("The job list response was incomplete.");
  return { ...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [], salaryMin: job.salaryMin == null ? null : Number(job.salaryMin), salaryMax: job.salaryMax == null ? null : Number(job.salaryMax) };
}

// ── Applications ─────────────────────────────────────────────────────────────

export async function fetchCompanyApplications(): Promise<CompanyApplication[]> {
  const res = await fetch("/api/company/applications");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load applications.");
  return (data.applications ?? []) as CompanyApplication[];
}

export async function updateApplicationStatus(applicationId: string, status: string): Promise<CompanyApplication> {
  const res = await fetch(`/api/company/applications/${encodeURIComponent(applicationId)}/status`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update application status.");
  return data.application as CompanyApplication;
}
