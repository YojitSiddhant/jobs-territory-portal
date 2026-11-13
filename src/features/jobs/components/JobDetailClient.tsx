"use client";

import { useReducer, useState, useTransition } from "react";
import Link from "next/link";
import type { PublicJob } from "../types";
import { applyToJob } from "../api";
import { fetchJobMatch, generateCoverLetter, type JobMatch } from "@/features/candidate-ai/api";
import { aiRequestReducer, createAiRequestState } from "@/features/candidate-ai/state";

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
  const [matchState, dispatchMatch] = useReducer(aiRequestReducer<JobMatch>, undefined, createAiRequestState);
  const [letterState, dispatchLetter] = useReducer(aiRequestReducer<string>, undefined, createAiRequestState);
  const match = matchState.value;
  const aiText = letterState.value ?? "";
  const aiError = matchState.error ?? letterState.error;
  const aiLoading = matchState.loading ? "match" : letterState.loading ? "letter" : null;

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

  async function handleMatch() {
    dispatchMatch({ type: "start" });
    try { dispatchMatch({ type: "success", value: await fetchJobMatch(job.id) }); } catch (err) { dispatchMatch({ type: "failure", message: err instanceof Error ? err.message : "Could not calculate a match." }); }
  }

  async function handleCoverLetter() {
    dispatchLetter({ type: "start" });
    try { dispatchLetter({ type: "success", value: await generateCoverLetter(job.id) }); } catch (err) { dispatchLetter({ type: "failure", message: err instanceof Error ? err.message : "Could not generate a cover letter." }); }
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
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        {/* Back link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All jobs
        </Link>

        {/* Job header */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6 mb-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-blue-600 mb-1">{job.company.name}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{job.title}</h1>
            </div>
            {/* Apply button area */}
            <div className="shrink-0">
              {submitted && (
                <span className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M12 3.5L5.5 10 2 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Applied
                </span>
              )}
              {!submitted && hasApplied && (
                <span className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-500">
                  Already applied
                </span>
              )}
              {!submitted && !hasApplied && !isExpired && isCandidate && !showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Apply now
                </button>
              )}
              {!isCandidate && !isExpired && (
                <Link
                  href="/login"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Sign in to apply
                </Link>
              )}
              {isExpired && (
                <span className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-600">
                  Applications closed
                </span>
              )}
            </div>
          </div>

          {/* Meta chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
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
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-600">
                {salary}
              </span>
            )}
            {deadline && (
              <span className={`rounded-md border px-2.5 py-1 ${isExpired ? "border-red-200 text-red-600" : "border-gray-200 text-gray-500"}`}>
                Deadline: {deadline}
              </span>
            )}
          </div>
        </div>

        {/* Apply form */}
        {isCandidate && <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 mb-5 shadow-sm space-y-4"><div><h2 className="text-base font-semibold text-gray-900">AI job tools</h2><p className="mt-1 text-xs text-gray-500">Use these private, informational tools before applying. AI does not make hiring decisions.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={handleMatch} disabled={Boolean(aiLoading)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{aiLoading === "match" ? "Calculating…" : "Check my match"}</button><button type="button" onClick={handleCoverLetter} disabled={Boolean(aiLoading)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-50">{aiLoading === "letter" ? "Generating…" : "Generate cover letter"}</button></div>{aiError && <div className="text-sm text-red-600">{aiError}<button type="button" onClick={() => { dispatchMatch({ type: "dismiss" }); dispatchLetter({ type: "dismiss" }); }} className="ml-2 underline">Dismiss</button></div>}{match && <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2"><div className="flex justify-between"><span className="text-sm font-medium text-gray-700">Resume-to-job match</span><span className="text-lg font-semibold text-blue-600">{match.score}%</span></div><p className="text-sm text-gray-600">{match.explanation}</p><p className="text-xs text-gray-500"><strong>Matched:</strong> {match.matchedSkills.join(", ") || "None identified"}</p><p className="text-xs text-gray-500"><strong>Missing:</strong> {match.missingSkills.join(", ") || "None identified"}</p></div>}{aiText && <div className="space-y-2"><label htmlFor="ai-cover-letter" className="text-xs font-semibold uppercase tracking-wide text-gray-500">Editable cover letter</label><textarea id="ai-cover-letter" value={aiText} onChange={(event) => dispatchLetter({ type: "success", value: event.target.value })} maxLength={4000} rows={10} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 leading-relaxed" /><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { localStorage.setItem(`jobs-territory-cover-letter:${job.id}`, aiText); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700">Save draft</button><button type="button" onClick={() => void navigator.clipboard.writeText(aiText)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700">Copy</button><button type="button" onClick={handleCoverLetter} disabled={Boolean(aiLoading)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700">Regenerate</button></div></div>}</div>}

        {showForm && !hasApplied && !isExpired && (
          <div className="rounded-2xl bg-white border border-gray-200 p-6 mb-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Apply for this role</h2>
            <p className="text-xs text-gray-400 mb-4">
              Your profile and resume will be shared with the company.
            </p>
            <label htmlFor="cover-note" className="block text-xs font-medium text-gray-500 mb-1.5">
              Cover letter <span className="text-gray-300">(optional)</span>
            </label>
            <textarea
              id="cover-note"
              rows={5}
              maxLength={10000}
              placeholder="Tell the company why you're a great fit…"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none resize-y transition-colors"
            />
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleApply}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
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
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Company info */}
        {(job.company.industry || job.company.website) && (
          <div className="rounded-2xl bg-white border border-gray-200 p-5 mb-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">About the company</h2>
            <p className="text-sm font-medium text-gray-800">{job.company.name}</p>
            {job.company.industry && (
              <p className="text-xs text-gray-400 mt-0.5">{job.company.industry}</p>
            )}
            {job.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-500 transition-colors"
              >
                {job.company.website}
              </a>
            )}
          </div>
        )}

        {/* Skills */}
        {job.requiredSkills.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-5 mb-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Required skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Job description</h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {job.description}
          </div>
        </div>
      </div>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1">
      {children}
    </span>
  );
}
