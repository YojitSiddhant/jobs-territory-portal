import type { JobsResponse, JobDetailResponse, JobDiscoveryQuery, Pagination, PublicJob } from "./types";

const defaultPagination: Pagination = { page: 1, pageSize: 20, total: 0, totalPages: 0 };

export function normalizeJobsResponse(value: unknown): JobsResponse {
  const root = value && typeof value === "object" ? value as { data?: unknown; jobs?: unknown; pagination?: unknown } : {};
  const nested = root.data && typeof root.data === "object" ? root.data as { jobs?: unknown; pagination?: unknown } : {};
  const jobsValue = nested.jobs ?? root.jobs;
  const paginationValue = nested.pagination ?? root.pagination;
  const pagination = paginationValue && typeof paginationValue === "object" ? paginationValue as Partial<Pagination> : {};
  const page = positiveInteger(pagination.page, defaultPagination.page);
  const pageSize = positiveInteger(pagination.pageSize, defaultPagination.pageSize);
  const total = nonNegativeInteger(pagination.total, defaultPagination.total);
  const totalPages = nonNegativeInteger(pagination.totalPages, total === 0 ? 0 : Math.ceil(total / pageSize));
  return {
    jobs: Array.isArray(jobsValue) ? jobsValue as PublicJob[] : [],
    pagination: { page, pageSize, total, totalPages },
  };
}

function positiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}

function nonNegativeInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : fallback;
}

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
  return normalizeJobsResponse(data);
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
