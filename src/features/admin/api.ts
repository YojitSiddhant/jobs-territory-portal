import type { AdminCompany, VerificationCounts } from "./types";

export function adminCompanyFromResponse(value: unknown): AdminCompany {
  const root = value as { data?: unknown; company?: unknown } | null;
  const nested = root?.data as { company?: unknown } | null | undefined;
  const company = nested?.company ?? root?.company ?? (root?.data && typeof root.data === "object" && "id" in root.data ? root.data : undefined);
  if (!company || typeof company !== "object" || !("id" in company) || !("status" in company)) throw new Error("The admin company response was incomplete.");
  return company as AdminCompany;
}

async function parseCompanyActionResponse(companyId: string, res: Response, fallbackMessage: string): Promise<AdminCompany> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? fallbackMessage);
  try { return adminCompanyFromResponse(data); } catch {
    // Some action endpoints may return only an action result. Preserve a complete state.
    return fetchAdminCompany(companyId);
  }
}

export async function fetchVerificationCounts(): Promise<VerificationCounts> {
  const res = await fetch("/api/admin/verification/counts");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load counts.");
  return data.counts as VerificationCounts;
}

export async function fetchPendingCompanies(): Promise<AdminCompany[]> {
  const res = await fetch("/api/admin/companies");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load companies.");
  return (data.companies ?? []) as AdminCompany[];
}

export async function fetchAdminCompany(companyId: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load company.");
  return adminCompanyFromResponse(data);
}

export async function approveCompany(companyId: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/approve`, { method: "POST" });
  return parseCompanyActionResponse(companyId, res, "Failed to approve company.");
}

export async function rejectCompany(companyId: string, reason: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/reject`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }),
  });
  return parseCompanyActionResponse(companyId, res, "Failed to reject company.");
}

export async function suspendCompany(companyId: string, reason: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/suspend`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }),
  });
  return parseCompanyActionResponse(companyId, res, "Failed to suspend company.");
}

export async function restoreCompany(companyId: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/restore`, { method: "POST" });
  return parseCompanyActionResponse(companyId, res, "Failed to restore company.");
}

async function reviewItem(url: string, body: { decision: "VERIFIED" | "REJECTED"; reason?: string }): Promise<AdminCompany> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return parseCompanyActionResponse(companyIdFromReviewUrl(url), res, "Review action failed.");
}

function companyIdFromReviewUrl(url: string) {
  const match = url.match(/\/companies\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function reviewCompanyField(companyId: string, field: string, decision: "VERIFIED" | "REJECTED", reason?: string) {
  return reviewItem(`/api/admin/companies/${encodeURIComponent(companyId)}/review/field`, { decision, reason, field } as { decision: "VERIFIED" | "REJECTED"; reason?: string });
}

export function reviewCompanyDocument(companyId: string, documentId: string, decision: "VERIFIED" | "REJECTED", reason?: string) {
  return reviewItem(`/api/admin/companies/${encodeURIComponent(companyId)}/review/document/${encodeURIComponent(documentId)}`, { decision, reason });
}
