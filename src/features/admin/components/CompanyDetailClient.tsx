"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { AdminCompany } from "../types";
import { approveCompany, rejectCompany, suspendCompany, restoreCompany, fetchAdminCompany, reviewCompanyField, reviewCompanyDocument } from "../api";
import { ReviewDialog } from "./ReviewDialog";

type Action = "approve" | "reject" | "suspend" | "restore" | "verify-item" | "reject-item";

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending review", cls: "border-yellow-200 bg-yellow-50 text-yellow-600" },
  APPROVED: { label: "Approved", cls: "border-blue-200 bg-blue-50 text-blue-600" },
  REJECTED: { label: "Rejected", cls: "border-red-200 bg-red-50 text-red-600" },
  SUSPENDED: { label: "Suspended", cls: "border-orange-200 bg-orange-50 text-orange-600" },
};

const docTypeLabels: Record<string, string> = {
  REGISTRATION_CERTIFICATE: "Registration certificate",
  TAX_DOCUMENT: "Tax document",
  IDENTITY_DOCUMENT: "Identity document",
  OTHER: "Other",
};

const docStatusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "text-yellow-600 border-yellow-200" },
  VERIFIED: { label: "Verified", cls: "text-blue-600 border-blue-200" },
  REJECTED: { label: "Rejected", cls: "text-red-600 border-red-200" },
};

const fieldLabels: Record<string, string> = { NAME: "Company name", REGISTRATION_NUMBER: "Registration number", WEBSITE: "Website", CONTACT_EMAIL: "Official email", PHONE: "Phone", INDUSTRY: "Industry", ADDRESS: "Address", DESCRIPTION: "Description" };

type Props = { initialCompany: AdminCompany | null };

export function CompanyDetailClient({ initialCompany }: Props) {
  const [company, setCompany] = useState<AdminCompany | null>(initialCompany);
  const [dialog, setDialog] = useState<Action | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ kind: "field" | "document"; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      if (!company) return;
      try { setCompany(await fetchAdminCompany(company.id)); } catch (err) { setError(err instanceof Error ? err.message : "Failed to refresh company."); }
    });
  }

  async function handleAction(action: Action, reason?: string) {
    if (!company || isActionPending) return;
    setError(null); setSuccess(null); setIsActionPending(true);
    try {
      let updated: AdminCompany;
      if ((action === "verify-item" || action === "reject-item") && reviewTarget) {
        updated = reviewTarget.kind === "field"
          ? await reviewCompanyField(company.id, reviewTarget.id, action === "verify-item" ? "VERIFIED" : "REJECTED", reason)
          : await reviewCompanyDocument(company.id, reviewTarget.id, action === "verify-item" ? "VERIFIED" : "REJECTED", reason);
        setReviewTarget(null);
      } else if (action === "approve") updated = await approveCompany(company.id);
      else if (action === "reject") updated = await rejectCompany(company.id, reason!);
      else if (action === "suspend") updated = await suspendCompany(company.id, reason!);
      else if (action === "restore") updated = await restoreCompany(company.id);
      else return;
      setCompany((current) => current ? { ...current, ...updated, fields: updated.fields ?? current.fields, documents: updated.documents ?? current.documents, reviews: updated.reviews ?? current.reviews, itemReviewHistory: updated.itemReviewHistory ?? current.itemReviewHistory } : updated);
      setSuccess(action === "approve" ? "Company approved successfully." : action === "reject" || action === "reject-item" ? "Rejection recorded successfully." : action === "verify-item" ? "Verification recorded successfully." : "Company status updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The review action failed.");
      throw err;
    } finally { setIsActionPending(false); }
  }

  if (!company) return <main className="min-h-screen bg-gray-50"><div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">Company details are unavailable. Refresh the page or return to the company list.</div></div></main>;

  const sc = statusConfig[company.status] ?? { label: company.status, cls: "border-zinc-700 text-zinc-400" };

  const availableActions: Action[] = [];
  if (company.status === "PENDING") availableActions.push("approve", "reject");
  if (company.status === "APPROVED") availableActions.push("suspend");
  if (company.status === "SUSPENDED") availableActions.push("restore");

  return (
    <main className="min-h-screen bg-gray-50">
      {dialog && (
        <ReviewDialog
          action={dialog}
          onConfirm={(reason) => handleAction(dialog, reason)}
              onClose={() => { setDialog(null); setReviewTarget(null); }}
        />
      )}

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {/* Back + header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/companies" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors mb-2">
              <ArrowLeft className="h-3 w-3" aria-hidden />
              Pending companies
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{company.name ?? "—"}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
            </div>
          </div>
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh company details" title="Refresh" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden />
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{success}</div>}

        {/* Actions */}
        {availableActions.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Review actions</h2>
            <div className="flex flex-wrap gap-2">
              {availableActions.includes("approve") && (
                <button type="button" onClick={() => setDialog("approve")} disabled={!company.canApprove || isActionPending} title={!company.canApprove ? "Verify all required fields and documents first" : undefined} className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 transition-colors">Approve</button>
              )}
              {availableActions.includes("reject") && (
                <button type="button" onClick={() => setDialog("reject")} disabled={isActionPending} className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors">Reject</button>
              )}
              {availableActions.includes("suspend") && (
                <button type="button" onClick={() => setDialog("suspend")} disabled={isActionPending} className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100 disabled:opacity-40 transition-colors">Suspend</button>
              )}
              {availableActions.includes("restore") && (
                <button type="button" onClick={() => setDialog("restore")} disabled={isActionPending} className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-40 transition-colors">Restore</button>
              )}
            </div>
          </div>
        )}

        {/* Rejection/suspension reason */}
        {company.rejectionReason && (
          <div className={`rounded-xl border px-4 py-3 ${company.status === "REJECTED" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
            <p className={`text-xs font-semibold mb-1 ${company.status === "REJECTED" ? "text-red-600" : "text-orange-600"}`}>
              {company.status === "REJECTED" ? "Rejection reason" : "Suspension reason"}
            </p>
            <p className="text-sm text-gray-700">{company.rejectionReason}</p>
          </div>
        )}

        {/* Company details */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Company details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail label="Owner email" value={company.owner.email} />
            <Detail label="Registration no." value={company.registrationNumber} />
            <div><dt className="text-xs text-gray-400 mb-0.5">Website</dt><dd className="text-sm text-gray-900">{company.website && /^https:\/\//i.test(company.website) ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{company.website}</a> : company.website ?? "—"}</dd></div>
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
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{company.description}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-gray-900">Field verification</h2><span className="text-xs text-gray-500">All required fields must be verified</span></div>
          <ul className="divide-y divide-gray-100">{company.fields.map((item) => <li key={item.field} className="flex items-start justify-between gap-4 py-3"><div><p className="text-xs text-gray-400">{fieldLabels[item.field] ?? item.field}</p><p className="text-sm text-gray-900 whitespace-pre-wrap">{item.value ?? "—"}</p>{item.reason && <p className="text-xs text-red-600 mt-1">Rejected: {item.reason}</p>}</div><div className="flex shrink-0 items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-xs ${item.status === "VERIFIED" ? "text-blue-600 border-blue-200" : item.status === "REJECTED" ? "text-red-600 border-red-200" : "text-yellow-600 border-yellow-200"}`}>{item.status[0] + item.status.slice(1).toLowerCase()}</span><button type="button" onClick={() => { setReviewTarget({ kind: "field", id: item.field }); setDialog("verify-item"); }} className="text-xs text-blue-700">Verify</button><button type="button" onClick={() => { setReviewTarget({ kind: "field", id: item.field }); setDialog("reject-item"); }} className="text-xs text-red-600">Reject</button></div></li>)}</ul>
        </div>

        {/* Documents — metadata only, no download links */}
        {company.documents.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-3 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Verification documents</h2>
            <ul className="space-y-2">
              {company.documents.map((doc) => {
                const dsc = docStatusConfig[doc.status] ?? { label: doc.status, cls: "text-gray-500 border-gray-200" };
                return (
                  <li key={doc.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{docTypeLabels[doc.type] ?? doc.type} · {doc.mimeType} · uploaded {new Date(doc.createdAt).toLocaleDateString("en-IN")}</p>
                      {doc.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{doc.rejectionReason}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2"><a href={doc.previewPath} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700">Preview</a><a href={`${doc.previewPath}?download=1`} className="text-xs text-gray-600">Download</a><button type="button" onClick={() => { setReviewTarget({ kind: "document", id: doc.id }); setDialog("verify-item"); }} className="text-xs text-blue-700">Verify</button><button type="button" onClick={() => { setReviewTarget({ kind: "document", id: doc.id }); setDialog("reject-item"); }} className="text-xs text-red-600">Reject</button><span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${dsc.cls}`}>{dsc.label}</span></div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Audit history */}
        {company.reviews.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-3 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Audit history</h2>
            <ol className="relative border-l border-gray-200 ml-2 space-y-4">
              {company.reviews.map((review) => (
                <li key={review.id} className="ml-4">
                  <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full border border-gray-200 bg-white" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{review.decision}</span>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <p className="text-xs text-gray-400">by {review.admin.email}</p>
                    {review.reason && <p className="text-xs text-gray-500 mt-0.5 italic">{review.reason}</p>}
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
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}
