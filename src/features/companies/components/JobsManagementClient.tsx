"use client";

import { useState, useTransition, useMemo } from "react";
import type { CompanyJob } from "../types";
import { publishJob, closeJob, fetchCompanyJobs } from "../api";
import { JobForm } from "./JobForm";

const statusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "border-gray-300 text-gray-500" },
  PUBLISHED: { label: "Published", cls: "border-emerald-200 text-emerald-600 bg-emerald-50" },
  CLOSED: { label: "Closed", cls: "border-gray-200 text-gray-400 bg-gray-50" },
};

type Props = { initialJobs: CompanyJob[] };

export function JobsManagementClient({ initialJobs }: Props) {
  const now = useMemo(() => new Date(), []);
  const [jobs, setJobs] = useState(initialJobs);
  const [editing, setEditing] = useState<CompanyJob | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ jobId: string; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setJobs(await fetchCompanyJobs()); } catch { /* silent */ }
    });
  }

  function handlePublish(jobId: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        const updated = await publishJob(jobId);
        setJobs((prev) => prev.map((j) => (j.id === jobId ? toClientJob(updated) : j)));
      } catch (err) {
        setActionError({ jobId, message: err instanceof Error ? err.message : "Failed to publish." });
      }
    });
  }

  function handleClose(jobId: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        const updated = await closeJob(jobId);
        setJobs((prev) => prev.map((j) => (j.id === jobId ? toClientJob(updated) : j)));
      } catch (err) {
        setActionError({ jobId, message: err instanceof Error ? err.message : "Failed to close." });
      }
    });
  }

  function handleSaved(saved: CompanyJob) {
    const job = toClientJob(saved);
    setJobs((prev) =>
      prev.some((j) => j.id === job.id) ? prev.map((j) => (j.id === job.id ? job : j)) : [job, ...prev]
    );
    setEditing(null);
    setError(null);
    setSuccess(saved.status === "DRAFT" ? (jobs.some((j) => j.id === job.id) ? "Job draft saved successfully." : "Job draft created successfully.") : "Job saved successfully.");
  }

  if (editing !== null) {
    const job = editing === "new" ? undefined : editing;
    return (
      <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-1">Jobs Territory</p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{job ? "Edit job" : "Create job"}</h1>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <JobForm job={job} onSaved={handleSaved} onCancel={() => setEditing(null)} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-1">Jobs Territory</p>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Job management</h1>
            <p className="mt-1 text-sm text-gray-500">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setEditing("new")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
              + New job
            </button>
            <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
                <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm font-medium text-gray-700">No jobs yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first job posting.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => {
              const sc = statusConfig[job.status] ?? { label: job.status, cls: "border-gray-200 text-gray-500" };
              const isExpired = job.applicationDeadline !== null && new Date(job.applicationDeadline) < now;
              return (
                <li key={job.id} className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{job.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                        {isExpired && job.status === "PUBLISHED" && (
                          <span className="text-xs text-amber-600">Deadline passed</span>
                        )}
                        {job.applicationDeadline && !isExpired && (
                          <span className="text-xs text-gray-400">Closes {new Date(job.applicationDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {job.status === "DRAFT" && (
                        <>
                          <button type="button" onClick={() => setEditing(job)} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">Edit</button>
                          <button type="button" onClick={() => handlePublish(job.id)} disabled={isPending} className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors">Publish</button>
                        </>
                      )}
                      {job.status === "PUBLISHED" && (
                        <button type="button" onClick={() => handleClose(job.id)} disabled={isPending} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-50 transition-colors">Close</button>
                      )}
                    </div>
                  </div>
                  {actionError?.jobId === job.id && (
                    <p className="mt-2 text-xs text-red-600">{actionError.message}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

function toClientJob(job: CompanyJob): CompanyJob {
  return {
    ...job,
    salaryMin: job.salaryMin !== null ? Number(job.salaryMin) : null,
    salaryMax: job.salaryMax !== null ? Number(job.salaryMax) : null,
    requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
  };
}
