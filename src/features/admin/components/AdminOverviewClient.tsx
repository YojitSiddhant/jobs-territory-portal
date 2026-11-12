"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { VerificationCounts } from "../types";
import { fetchVerificationCounts } from "../api";

type Props = { initialCounts: VerificationCounts };

export function AdminOverviewClient({ initialCounts }: Props) {
  const [counts, setCounts] = useState(initialCounts);
  const [isRefreshing, startRefreshTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setCounts(await fetchVerificationCounts()); } catch { /* silent */ }
    });
  }

  const stats: { label: string; value: number; cls: string; href: string }[] = [
    { label: "Pending review", value: counts.PENDING, cls: "text-yellow-600", href: "/admin/companies" },
    { label: "Approved", value: counts.APPROVED, cls: "text-blue-600", href: "/admin/companies?status=APPROVED" },
    { label: "Rejected", value: counts.REJECTED, cls: "text-red-600", href: "/admin/companies?status=REJECTED" },
    { label: "Suspended", value: counts.SUSPENDED, cls: "text-orange-600", href: "/admin/companies?status=SUSPENDED" },
  ];

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">Jobs Territory — Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          </div>
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
              <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Count cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="group rounded-2xl bg-white border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-colors shadow-sm">
              <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="mt-1 text-xs text-gray-500 group-hover:text-gray-900 transition-colors">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/companies" className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-600 hover:bg-yellow-100 transition-colors">
              Review pending companies ({counts.PENDING})
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
