"use client";

import { useState, useTransition } from "react";
import type { CompanyApplication } from "../types";
import { fetchCompanyApplications, updateApplicationStatus } from "../api";

const statusLabels: Record<string, { label: string; cls: string }> = {
  APPLIED: { label: "Applied", cls: "border-blue-200 bg-blue-50 text-blue-600" },
  REVIEWING: { label: "In review", cls: "border-yellow-200 bg-yellow-50 text-yellow-600" },
  SHORTLISTED: { label: "Shortlisted", cls: "border-blue-200 bg-blue-50 text-blue-600" },
  REJECTED: { label: "Not selected", cls: "border-red-200 bg-red-50 text-red-600" },
  HIRED: { label: "Hired", cls: "border-blue-200 bg-blue-100 text-blue-700" },
  WITHDRAWN: { label: "Withdrawn", cls: "border-gray-200 bg-gray-100 text-gray-500" },
};

const transitions: Record<string, string[]> = {
  APPLIED: ["REVIEWING", "REJECTED"],
  REVIEWING: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["HIRED", "REJECTED"],
  REJECTED: [], HIRED: [], WITHDRAWN: [],
};

const transitionLabels: Record<string, string> = {
  REVIEWING: "Move to review",
  SHORTLISTED: "Shortlist",
  HIRED: "Mark hired",
  REJECTED: "Reject",
};

type Props = { initialApplications: CompanyApplication[] };

export function CompanyApplicationsClient({ initialApplications }: Props) {
  const [applications, setApplications] = useState(initialApplications);
  const [selected, setSelected] = useState<CompanyApplication | null>(null);
  const [actionError, setActionError] = useState<{ id: string; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setApplications(await fetchCompanyApplications()); } catch { /* silent */ }
    });
  }

  function handleStatusChange(applicationId: string, status: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        const updated = await updateApplicationStatus(applicationId, status);
        const app = toClientApp(updated);
        setApplications((prev) => prev.map((a) => (a.id === applicationId ? app : a)));
        if (selected?.id === applicationId) setSelected(app);
      } catch (err) {
        setActionError({ id: applicationId, message: err instanceof Error ? err.message : "Failed to update." });
      }
    });
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">Jobs Territory</p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Applications</h1>
            <p className="mt-1 text-sm text-gray-500">{applications.length} application{applications.length !== 1 ? "s" : ""} received</p>
          </div>
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
              <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{selected.job.title}</p>
                <h2 className="text-base font-semibold text-gray-900">{selected.candidate?.fullName ?? "Anonymous"}</h2>
                {selected.candidate?.headline && <p className="text-xs text-gray-500 mt-0.5">{selected.candidate.headline}</p>}
                {selected.candidate?.location && <p className="text-xs text-gray-400 mt-0.5">{selected.candidate.location}</p>}
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Status:</span>
              <StatusChip status={selected.status} />
            </div>
            {selected.coverNote && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cover letter</p>
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.coverNote}</div>
              </div>
            )}
            {/* Status actions */}
            {(transitions[selected.status] ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(transitions[selected.status] ?? []).map((next) => (
                  <button key={next} type="button" onClick={() => handleStatusChange(selected.id, next)} disabled={isPending} className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors ${next === "REJECTED" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}>
                    {transitionLabels[next] ?? next}
                  </button>
                ))}
              </div>
            )}
            {actionError?.id === selected.id && <p className="text-xs text-red-600">{actionError.message}</p>}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-700">No applications yet</p>
            <p className="text-xs text-gray-400 mt-1">Applications from candidates will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => (
              <li key={app.id}>
                <button type="button" onClick={() => setSelected(selected?.id === app.id ? null : app)} className={`group w-full text-left rounded-2xl border p-5 transition-colors ${selected?.id === app.id ? "bg-gray-50 border-gray-300" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{app.job.title}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{app.candidate?.fullName ?? "Anonymous"}</p>
                      {app.candidate?.headline && <p className="text-xs text-gray-500 mt-0.5 truncate">{app.candidate.headline}</p>}
                    </div>
                    <StatusChip status={app.status} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function StatusChip({ status }: { status: string }) {
  const { label, cls } = statusLabels[status] ?? { label: status, cls: "border-gray-200 text-gray-500" };
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function toClientApp(app: CompanyApplication): CompanyApplication {
  return { ...app };
}
