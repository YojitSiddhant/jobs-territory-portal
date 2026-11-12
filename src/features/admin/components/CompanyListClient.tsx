"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AdminCompany } from "../types";
import { fetchPendingCompanies } from "../api";

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "border-yellow-200 bg-yellow-50 text-yellow-600" },
  APPROVED: { label: "Approved", cls: "border-blue-200 bg-blue-50 text-blue-600" },
  REJECTED: { label: "Rejected", cls: "border-red-200 bg-red-50 text-red-600" },
  SUSPENDED: { label: "Suspended", cls: "border-orange-200 bg-orange-50 text-orange-600" },
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
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">Jobs Territory — Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Pending verification</h1>
            <p className="mt-1 text-sm text-gray-500">{companies.length} compan{companies.length !== 1 ? "ies" : "y"} awaiting review</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">← Dashboard</Link>
            <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
                <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-700">No companies pending review</p>
            <p className="text-xs text-gray-400 mt-1">New submissions will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {companies.map((company) => {
              const sc = statusConfig[company.status] ?? { label: company.status, cls: "border-gray-200 text-gray-500" };
              return (
                <li key={company.id}>
                  <Link href={`/admin/companies/${company.id}`} className="group block rounded-2xl bg-white border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-colors shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{company.name ?? "—"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{company.industry ?? "—"} · {company.owner.email}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                    </div>
                    {company.verificationSubmittedAt && (
                      <p className="mt-2 text-xs text-gray-400">
                        Submitted {new Date(company.verificationSubmittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
    </main>
  );
}
