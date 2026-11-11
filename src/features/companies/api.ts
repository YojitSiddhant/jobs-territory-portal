import type { CompanyProfile, CompanyJob, CompanyApplication, JobFormInput } from "./types";

// ── Company profile ──────────────────────────────────────────────────────────

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  const res = await fetch("/api/company/profile");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load company profile.");
  return data.company as CompanyProfile;
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
  return data.company as CompanyProfile;
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
  return data.company as CompanyProfile;
}

export async function submitCompanyForReview(): Promise<CompanyProfile> {
  const res = await fetch("/api/company/profile/submit", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to submit for review.");
  return data.company as CompanyProfile;
}

export async function registerDocument(input: {
  type: string; storageKey: string; originalName: string; mimeType: string;
}): Promise<{ id: string; type: string; status: string; originalName: string; mimeType: string }> {
  const res = await fetch("/api/company/profile/documents", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to register document.");
  return data.document;
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export async function fetchCompanyJobs(): Promise<CompanyJob[]> {
  const res = await fetch("/api/company/jobs");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load jobs.");
  return (data.jobs ?? []) as CompanyJob[];
}

export async function fetchCompanyJob(jobId: string): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load job.");
  return data.job as CompanyJob;
}

export async function createJob(input: JobFormInput): Promise<CompanyJob> {
  const res = await fetch("/api/company/jobs", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create job.");
  return data.job as CompanyJob;
}

export async function updateJob(jobId: string, input: Partial<JobFormInput>): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update job.");
  return data.job as CompanyJob;
}

export async function publishJob(jobId: string): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}/publish`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to publish job.");
  return data.job as CompanyJob;
}

export async function closeJob(jobId: string): Promise<CompanyJob> {
  const res = await fetch(`/api/company/jobs/${encodeURIComponent(jobId)}/close`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to close job.");
  return data.job as CompanyJob;
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
