"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AdminCompany } from "../types";
import { fetchPendingCompanies } from "../api";

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "border-yellow-700/40 bg-yellow-900/10 text-yellow-400" },
  APPROVED: { label: "Approved", cls: "border-emerald-700/40 bg-emerald-900/10 text-emerald-400" },
  REJECTED: { label: "Rejected", cls: "border-red-800/40 bg-red-900/10 text-red-400" },
  SUSPENDED: { label: "Suspended", cls: "border-orange-800/40 bg-orange-900/10 text-orange-400" },
};

type Props = { initialCompanies: AdminCompany[] };

export function CompanyListClient({ initialCompanies }: Props) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [isRefreshing, startRefreshTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setCompanies(await fetchPendingCompanies()); } catch { /* silent */ }
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400 mb-1">Jobs Territory — Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Pending verification</h1>
            <p className="mt-1 text-sm text-zinc-400">{companies.length} compan{companies.length !== 1 ? "ies" : "y"} awaiting review</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500 transition-colors">← Dashboard</Link>
            <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
                <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
            <p className="text-sm font-medium text-zinc-300">No companies pending review</p>
            <p className="text-xs text-zinc-500 mt-1">New submissions will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {companies.map((company) => {
              const sc = statusConfig[company.status] ?? { label: company.status, cls: "border-zinc-700 text-zinc-400" };
              return (
                <li key={company.id}>
                  <Link href={`/admin/companies/${company.id}`} className="group block rounded-2xl bg-zinc-900 border border-zinc-800 p-5 hover:border-zinc-600 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">{company.name ?? "—"}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{company.industry ?? "—"} · {company.owner.email}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                    </div>
                    {company.verificationSubmittedAt && (
                      <p className="mt-2 text-xs text-zinc-600">
                        Submitted {new Date(company.verificationSubmittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
