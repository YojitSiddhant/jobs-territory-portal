"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AdminCompany } from "../types";
import { approveCompany, rejectCompany, suspendCompany, restoreCompany, fetchAdminCompany } from "../api";
import { ReviewDialog } from "./ReviewDialog";

type Action = "approve" | "reject" | "suspend" | "restore";

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending review", cls: "border-yellow-700/40 bg-yellow-900/10 text-yellow-400" },
  APPROVED: { label: "Approved", cls: "border-emerald-700/40 bg-emerald-900/10 text-emerald-400" },
  REJECTED: { label: "Rejected", cls: "border-red-800/40 bg-red-900/10 text-red-400" },
  SUSPENDED: { label: "Suspended", cls: "border-orange-800/40 bg-orange-900/10 text-orange-400" },
};

const docTypeLabels: Record<string, string> = {
  REGISTRATION_CERTIFICATE: "Registration certificate",
  TAX_DOCUMENT: "Tax document",
  IDENTITY_DOCUMENT: "Identity document",
  OTHER: "Other",
};

const docStatusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "text-yellow-400 border-yellow-700/40" },
  APPROVED: { label: "Approved", cls: "text-emerald-400 border-emerald-700/40" },
  REJECTED: { label: "Rejected", cls: "text-red-400 border-red-800/40" },
};

type Props = { initialCompany: AdminCompany };

export function CompanyDetailClient({ initialCompany }: Props) {
  const [company, setCompany] = useState(initialCompany);
  const [dialog, setDialog] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startRefreshTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setCompany(await fetchAdminCompany(company.id)); } catch { /* silent */ }
    });
  }

  async function handleAction(action: Action, reason?: string) {
    setError(null);
    let updated: AdminCompany;
    if (action === "approve") updated = await approveCompany(company.id);
    else if (action === "reject") updated = await rejectCompany(company.id, reason!);
    else if (action === "suspend") updated = await suspendCompany(company.id, reason!);
    else updated = await restoreCompany(company.id);
    setCompany(updated);
  }

  const sc = statusConfig[company.status] ?? { label: company.status, cls: "border-zinc-700 text-zinc-400" };

  const availableActions: Action[] = [];
  if (company.status === "PENDING") availableActions.push("approve", "reject");
  if (company.status === "APPROVED") availableActions.push("suspend");
  if (company.status === "SUSPENDED") availableActions.push("restore");

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      {dialog && (
        <ReviewDialog
          action={dialog}
          onConfirm={(reason) => handleAction(dialog, reason)}
          onClose={() => setDialog(null)}
        />
      )}

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back + header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/companies" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-2">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Pending companies
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{company.name ?? "—"}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
            </div>
          </div>
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
              <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">{error}</div>}

        {/* Actions */}
        {availableActions.length > 0 && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">Review actions</h2>
            <div className="flex flex-wrap gap-2">
              {availableActions.includes("approve") && (
                <button type="button" onClick={() => setDialog("approve")} className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors">Approve</button>
              )}
              {availableActions.includes("reject") && (
                <button type="button" onClick={() => setDialog("reject")} className="rounded-xl bg-red-900/20 border border-red-700/40 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors">Reject</button>
              )}
              {availableActions.includes("suspend") && (
                <button type="button" onClick={() => setDialog("suspend")} className="rounded-xl bg-orange-900/20 border border-orange-700/40 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-900/30 transition-colors">Suspend</button>
              )}
              {availableActions.includes("restore") && (
                <button type="button" onClick={() => setDialog("restore")} className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors">Restore</button>
              )}
            </div>
          </div>
        )}

        {/* Rejection/suspension reason */}
        {company.rejectionReason && (
          <div className={`rounded-xl border px-4 py-3 ${company.status === "REJECTED" ? "border-red-800/40 bg-red-900/10" : "border-orange-800/40 bg-orange-900/10"}`}>
            <p className={`text-xs font-semibold mb-1 ${company.status === "REJECTED" ? "text-red-400" : "text-orange-400"}`}>
              {company.status === "REJECTED" ? "Rejection reason" : "Suspension reason"}
            </p>
            <p className="text-sm text-zinc-300">{company.rejectionReason}</p>
          </div>
        )}

        {/* Company details */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">Company details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail label="Owner email" value={company.owner.email} />
            <Detail label="Registration no." value={company.registrationNumber} />
            <Detail label="Website" value={company.website} />
            <Detail label="Official email" value={company.officialEmail} />
            <Detail label="Phone" value={company.phone} />
            <Detail label="Industry" value={company.industry} />
            <div className="col-span-full">
              <Detail label="Address" value={company.address} />
            </div>
            {company.verificationSubmittedAt && (
              <Detail label="Submitted" value={new Date(company.verificationSubmittedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
            )}
          </dl>
          {company.description && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">Description</p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{company.description}</p>
            </div>
          )}
        </div>

        {/* Documents — metadata only, no download links */}
        {company.documents.length > 0 && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-100">Verification documents</h2>
            <ul className="space-y-2">
              {company.documents.map((doc) => {
                const dsc = docStatusConfig[doc.status] ?? { label: doc.status, cls: "text-zinc-400 border-zinc-700" };
                return (
                  <li key={doc.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{doc.originalName}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{docTypeLabels[doc.type] ?? doc.type} · {doc.mimeType}</p>
                      {doc.rejectionReason && <p className="text-xs text-red-400 mt-0.5">{doc.rejectionReason}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${dsc.cls}`}>{dsc.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Audit history */}
        {company.reviews.length > 0 && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-100">Audit history</h2>
            <ol className="relative border-l border-zinc-700 ml-2 space-y-4">
              {company.reviews.map((review) => (
                <li key={review.id} className="ml-4">
                  <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full border border-zinc-700 bg-zinc-900" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">{review.decision}</span>
                      <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <p className="text-xs text-zinc-500">by {review.admin.email}</p>
                    {review.reason && <p className="text-xs text-zinc-400 mt-0.5 italic">{review.reason}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-zinc-200">{value ?? "—"}</dd>
    </div>
  );
}
