"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { AdminCompany } from "../types";
import { fetchAdminCompanies } from "../api";

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "border-yellow-200 bg-yellow-50 text-yellow-600" },
  APPROVED: { label: "Approved", cls: "border-blue-200 bg-blue-50 text-blue-600" },
  REJECTED: { label: "Rejected", cls: "border-red-200 bg-red-50 text-red-600" },
  SUSPENDED: { label: "Suspended", cls: "border-orange-200 bg-orange-50 text-orange-600" },
};

const tabs = [
  { status: "PENDING", label: "Pending" },
  { status: "APPROVED", label: "Approved" },
  { status: "REJECTED", label: "Rejected" },
  { status: "SUSPENDED", label: "Suspended" },
] as const;

const headings: Record<string, { title: string; count: (n: number) => string; empty: string }> = {
  PENDING: { title: "Pending verification", count: (n) => `${n} compan${n !== 1 ? "ies" : "y"} awaiting review`, empty: "No companies pending review" },
  APPROVED: { title: "Approved companies", count: (n) => `${n} verified compan${n !== 1 ? "ies" : "y"}`, empty: "No approved companies yet" },
  REJECTED: { title: "Rejected companies", count: (n) => `${n} rejected compan${n !== 1 ? "ies" : "y"}`, empty: "No rejected companies" },
  SUSPENDED: { title: "Suspended companies", count: (n) => `${n} suspended compan${n !== 1 ? "ies" : "y"}`, empty: "No suspended companies" },
};

type Props = { initialCompanies: AdminCompany[]; initialStatus?: string };

export function CompanyListClient({ initialCompanies, initialStatus = "PENDING" }: Props) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const heading = headings[initialStatus] ?? headings.PENDING!;

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setCompanies(await fetchAdminCompanies(initialStatus)); } catch { /* silent */ }
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="page-container py-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">Jobs Territory — Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{heading.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{heading.count(companies.length)}</p>
            <p className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">Showing {heading.title.toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Dashboard
            </Link>
            <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh company list" title="Refresh" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden />
            </button>
          </div>
        </div>

        <Link href="/admin/dashboard" className="inline-flex rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Clear filter</Link>

        {/* Status tabs */}
        <nav aria-label="Company status" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.status}
              href={tab.status === "PENDING" ? "/admin/companies" : `/admin/companies?status=${tab.status}`}
              aria-current={initialStatus === tab.status ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                initialStatus === tab.status
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-700">{heading.empty}</p>
            <p className="text-xs text-gray-400 mt-1">Companies will appear here as their status changes.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {companies.map((company) => {
              const sc = statusConfig[company.status] ?? { label: company.status, cls: "border-gray-200 text-gray-500" };
              return (
                <li key={company.id}>
                  <Link href={`/admin/companies/${company.id}`} className="group block rounded-2xl bg-white border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{company.name ?? "—"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{company.industry ?? "—"} · {company.owner.email}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                    </div>
                    {company.rejectionReason && (company.status === "REJECTED" || company.status === "SUSPENDED") && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        <span className={company.status === "REJECTED" ? "text-red-600" : "text-orange-600"}>Reason:</span> {company.rejectionReason}
                      </p>
                    )}
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
      </div>
    </main>
  );
}
