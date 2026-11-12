import type { AdminCompany, VerificationCounts } from "./types";

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
  return data.company as AdminCompany;
}

export async function approveCompany(companyId: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/approve`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to approve company.");
  return data.company as AdminCompany;
}

export async function rejectCompany(companyId: string, reason: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/reject`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to reject company.");
  return data.company as AdminCompany;
}

export async function suspendCompany(companyId: string, reason: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/suspend`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to suspend company.");
  return data.company as AdminCompany;
}

export async function restoreCompany(companyId: string): Promise<AdminCompany> {
  const res = await fetch(`/api/admin/companies/${encodeURIComponent(companyId)}/restore`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Failed to restore company.");
  return data.company as AdminCompany;
}

async function reviewItem(url: string, body: { decision: "VERIFIED" | "REJECTED"; reason?: string }): Promise<AdminCompany> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Review action failed.");
  return data.data?.company ?? data.company;
}

export function reviewCompanyField(companyId: string, field: string, decision: "VERIFIED" | "REJECTED", reason?: string) {
  return reviewItem(`/api/admin/companies/${encodeURIComponent(companyId)}/review/field`, { decision, reason, field } as { decision: "VERIFIED" | "REJECTED"; reason?: string });
}

export function reviewCompanyDocument(companyId: string, documentId: string, decision: "VERIFIED" | "REJECTED", reason?: string) {
  return reviewItem(`/api/admin/companies/${encodeURIComponent(companyId)}/review/document/${encodeURIComponent(documentId)}`, { decision, reason });
}
