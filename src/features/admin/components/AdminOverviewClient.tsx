"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import type { VerificationCounts } from "../types";
import { fetchVerificationCounts } from "../api";

type Props = { initialCounts: VerificationCounts };

export const adminStatusHref = (status: keyof VerificationCounts) => `/admin/companies?status=${status}`;

export function AdminOverviewClient({ initialCounts }: Props) {
  const [counts, setCounts] = useState(initialCounts);
  const [isRefreshing, startRefreshTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setCounts(await fetchVerificationCounts()); } catch { /* silent */ }
    });
  }

  const stats: { status: keyof VerificationCounts; label: string; supporting: string; value: number; cls: string; icon: typeof Clock3 }[] = [
    { status: "PENDING", label: "Pending review", supporting: "Awaiting verification", value: counts.PENDING, cls: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock3 },
    { status: "APPROVED", label: "Approved", supporting: "Verified companies", value: counts.APPROVED, cls: "text-blue-600 bg-blue-50 border-blue-200", icon: CheckCircle2 },
    { status: "REJECTED", label: "Rejected", supporting: "Needs attention", value: counts.REJECTED, cls: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
    { status: "SUSPENDED", label: "Suspended", supporting: "Currently restricted", value: counts.SUSPENDED, cls: "text-orange-600 bg-orange-50 border-orange-200", icon: ShieldAlert },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="page-container py-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">Jobs Territory — Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          </div>
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh dashboard" title="Refresh" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden />
          </button>
        </div>

        {/* Count cards */}
        <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-4 [&>*]:min-w-0">
          {stats.map((s) => (
            <Link key={s.label} href={adminStatusHref(s.status)} aria-label={`${s.label}: ${s.value}. View ${s.label.toLowerCase()} companies`} className="group flex min-h-44 flex-col items-center justify-center rounded-2xl border bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              <span className={`mb-3 inline-flex rounded-full border p-3 ${s.cls}`}><s.icon className="h-6 w-6" aria-hidden /></span>
              <p className={`text-3xl font-bold ${s.cls.split(" ")[0]}`}>{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{s.label}</p>
              <p className="mt-1 text-xs text-gray-500">{s.supporting}</p>
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
