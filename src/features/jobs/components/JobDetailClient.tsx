"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { PublicJob } from "../types";
import { applyToJob } from "../api";

const workplaceLabels: Record<string, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

const employmentLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}k`;
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)} per year`;
  if (min !== null) return `From ${fmt(min)} per year`;
  return `Up to ${fmt(max!)} per year`;
}

type Props = {
  job: PublicJob;
  hasApplied: boolean;
  isCandidate: boolean;
};

export function JobDetailClient({ job, hasApplied: initialHasApplied, isCandidate }: Props) {
  const [hasApplied, setHasApplied] = useState(initialHasApplied);
  const [showForm, setShowForm] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const isExpired =
    job.applicationDeadline !== null && new Date(job.applicationDeadline) < new Date();

  function handleApply() {
    setError(null);
    startTransition(async () => {
      try {
        await applyToJob(job.slug ?? "", coverNote || null);
        setHasApplied(true);
        setShowForm(false);
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit application.");
      }
    });
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All jobs
        </Link>

        {/* Job header */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-400 mb-1">{job.company.name}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{job.title}</h1>
            </div>
            {/* Apply button area */}
            <div className="shrink-0">
              {submitted && (
                <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-sm font-medium text-emerald-400">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M12 3.5L5.5 10 2 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Applied
                </span>
              )}
              {!submitted && hasApplied && (
                <span className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400">
                  Already applied
                </span>
              )}
              {!submitted && !hasApplied && !isExpired && isCandidate && !showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  Apply now
                </button>
              )}
              {!isCandidate && !isExpired && (
                <a
                  href="/api/auth/login"
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  Sign in to apply
                </a>
              )}
              {isExpired && (
                <span className="rounded-xl border border-amber-800/40 bg-amber-900/20 px-4 py-2.5 text-sm text-amber-400">
                  Applications closed
                </span>
              )}
            </div>
          </div>

          {/* Meta chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
            {job.location && (
              <Chip>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M6 1a3.5 3.5 0 0 1 3.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 0 1 6 1z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {job.location}
              </Chip>
            )}
            {job.workplaceType && <Chip>{workplaceLabels[job.workplaceType] ?? job.workplaceType}</Chip>}
            {job.employmentType && <Chip>{employmentLabels[job.employmentType] ?? job.employmentType}</Chip>}
            {job.experienceRequirement && <Chip>{job.experienceRequirement}</Chip>}
            {salary && (
              <span className="rounded-md border border-emerald-800/60 bg-emerald-900/20 px-2.5 py-1 text-emerald-400">
                {salary}
              </span>
            )}
            {deadline && (
              <span className={`rounded-md border px-2.5 py-1 ${isExpired ? "border-red-800/40 text-red-400" : "border-zinc-700 text-zinc-400"}`}>
                Deadline: {deadline}
              </span>
            )}
          </div>
        </div>

        {/* Apply form */}
        {showForm && !hasApplied && !isExpired && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 mb-5">
            <h2 className="text-base font-semibold text-zinc-100 mb-1">Apply for this role</h2>
            <p className="text-xs text-zinc-500 mb-4">
              Your profile and resume will be shared with the company.
            </p>
            <label htmlFor="cover-note" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Cover letter <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              id="cover-note"
              rows={5}
              maxLength={10000}
              placeholder="Tell the company why you're a great fit…"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none resize-y transition-colors"
            />
            {error && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleApply}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60 transition-colors"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  "Submit application"
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null); }}
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Company info */}
        {(job.company.industry || job.company.website) && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 mb-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">About the company</h2>
            <p className="text-sm font-medium text-zinc-200">{job.company.name}</p>
            {job.company.industry && (
              <p className="text-xs text-zinc-500 mt-0.5">{job.company.industry}</p>
            )}
            {job.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {job.company.website}
              </a>
            )}
          </div>
        )}

        {/* Skills */}
        {job.requiredSkills.length > 0 && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 mb-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">Required skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-sm font-semibold text-zinc-100 mb-4">Job description</h2>
          <div className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
            {job.description}
          </div>
        </div>
      </div>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-md border border-zinc-700 px-2.5 py-1">
      {children}
    </span>
  );
}
