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
