import type { JobsResponse, JobDetailResponse, JobDiscoveryQuery } from "./types";

export async function fetchJobs(query: JobDiscoveryQuery = {}): Promise<JobsResponse> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.location) params.set("location", query.location);
  if (query.workplaceType) params.set("workplaceType", query.workplaceType);
  if (query.employmentType) params.set("employmentType", query.employmentType);
  if (query.experience) params.set("experience", query.experience);
  if (query.skill) params.set("skill", query.skill);
  if (query.company) params.set("company", query.company);
  if (query.salaryMin !== undefined) params.set("salaryMin", String(query.salaryMin));
  if (query.salaryMax !== undefined) params.set("salaryMax", String(query.salaryMax));
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize));
  if (query.sort) params.set("sort", query.sort);

  const url = `/api/jobs?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load jobs.");
  return data as JobsResponse;
}

export async function fetchJob(slug: string): Promise<JobDetailResponse> {
  const res = await fetch(`/api/jobs/${encodeURIComponent(slug)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load job.");
  return data as JobDetailResponse;
}

export async function applyToJob(slug: string, coverNote?: string | null): Promise<void> {
  const res = await fetch(`/api/jobs/${encodeURIComponent(slug)}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coverNote: coverNote ?? null }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to submit application.");
}
