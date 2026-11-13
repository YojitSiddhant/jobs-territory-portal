"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Application } from "../types";
import { fetchMyApplications } from "../api";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationDetail } from "./ApplicationDetail";

type Props = { initialApplications: Application[] };

export function ApplicationsPage({ initialApplications }: Props) {
  const [applications, setApplications] = useState(initialApplications);
  const [selected, setSelected] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  function handleRefresh() {
    setError(null);
    startTransition(async () => {
      try {
        const fresh = await fetchMyApplications();
        setApplications(fresh);
        if (selected) {
          const updated = fresh.find((a) => a.id === selected.id);
          setSelected(updated ?? null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to refresh.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="page-container py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600 mb-1">
              Jobs Territory
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">My applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              {applications.length > 0
                ? `${applications.length} application${applications.length !== 1 ? "s" : ""}`
                : "Track all your job applications here."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Browse jobs
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh applications"
              className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={isRefreshing ? "animate-spin" : ""}
                aria-hidden
              >
                <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Application detail panel */}
        {selected && (
          <ApplicationDetail application={selected} onClose={() => setSelected(null)} />
        )}

        {/* Applications list */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-700">No applications yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Apply to jobs and track your progress here.
            </p>
            <Link
              href="/jobs"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Browse open jobs
            </Link>
            <Link
              href="/candidate/profile"
              className="mt-2 inline-block rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Complete your profile
            </Link>
          </div>
        ) : (
          <div className={`space-y-3 ${isRefreshing ? "opacity-60 pointer-events-none" : ""} transition-opacity`}>
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={() => setSelected(selected?.id === app.id ? null : app)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
