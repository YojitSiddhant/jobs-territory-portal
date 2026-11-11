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
    { label: "Pending review", value: counts.PENDING, cls: "text-yellow-400", href: "/admin/companies" },
    { label: "Approved", value: counts.APPROVED, cls: "text-emerald-400", href: "/admin/companies?status=APPROVED" },
    { label: "Rejected", value: counts.REJECTED, cls: "text-red-400", href: "/admin/companies?status=REJECTED" },
    { label: "Suspended", value: counts.SUSPENDED, cls: "text-orange-400", href: "/admin/companies?status=SUSPENDED" },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400 mb-1">Jobs Territory — Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Dashboard</h1>
          </div>
          <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
              <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Count cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-5 hover:border-zinc-600 transition-colors">
              <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="mt-1 text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-100 mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/companies" className="rounded-lg border border-yellow-700/40 bg-yellow-900/10 px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-900/20 transition-colors">
              Review pending companies ({counts.PENDING})
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
