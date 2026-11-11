"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { CompanyProfile } from "../types";
import { submitCompanyForReview, fetchCompanyProfile } from "../api";
import { CompanyProfileForm } from "./CompanyProfileForm";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import { DocumentsSection } from "./DocumentsSection";

type Props = { initialProfile: CompanyProfile | null };

export function CompanyDashboardClient({ initialProfile }: Props) {
  const [profile, setProfile] = useState<CompanyProfile | null>(initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();

  const canEdit = !profile || profile.status === "PENDING" || profile.status === "REJECTED";
  const canSubmit = profile && (profile.status === "PENDING" || profile.status === "REJECTED");

  function handleSaved(p: CompanyProfile) {
    setProfile(p);
    setError(null);
  }

  function handleRefresh() {
    startRefreshTransition(async () => {
      try { setProfile(await fetchCompanyProfile()); } catch { /* silent */ }
    });
  }

  function handleSubmit() {
    setError(null);
    startSubmitTransition(async () => {
      try {
        const updated = await submitCompanyForReview();
        setProfile(updated);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400 mb-1">Jobs Territory</p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Company dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {profile?.status === "APPROVED" && (
              <Link href="/company/jobs" className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500 transition-colors">Manage jobs</Link>
            )}
            <button type="button" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh" className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRefreshing ? "animate-spin" : ""} aria-hidden>
                <path d="M13.5 2.5A6.5 6.5 0 1 1 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status card */}
        {profile && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-100">{profile.name}</p>
              <VerificationStatusBadge status={profile.status} />
            </div>
            {profile.status === "REJECTED" && profile.rejectionReason && (
              <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3">
                <p className="text-xs font-semibold text-red-400 mb-1">Rejection reason</p>
                <p className="text-sm text-red-300">{profile.rejectionReason}</p>
              </div>
            )}
            {profile.status === "SUSPENDED" && profile.rejectionReason && (
              <div className="rounded-xl border border-orange-800/40 bg-orange-900/10 px-4 py-3">
                <p className="text-xs font-semibold text-orange-400 mb-1">Suspension reason</p>
                <p className="text-sm text-orange-300">{profile.rejectionReason}</p>
              </div>
            )}
            {profile.status === "APPROVED" && (
              <p className="text-xs text-zinc-400">Your company is verified. You can now manage jobs and applications.</p>
            )}
            {profile.status === "PENDING" && profile.verificationSubmittedAt && (
              <p className="text-xs text-zinc-400">Submitted for review on {new Date(profile.verificationSubmittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. An admin will review shortly.</p>
            )}
          </div>
        )}

        {/* Profile form */}
        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-100">{profile ? "Company profile" : "Register your company"}</h2>
          {!canEdit && profile && (
            <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/40 px-4 py-2 text-xs text-zinc-500">
              Profile editing is locked while the company is {profile.status.toLowerCase()}. Contact an admin to make changes.
            </div>
          )}
          <CompanyProfileForm profile={profile} onSaved={handleSaved} readonly={!canEdit} />
        </section>

        {/* Documents */}
        {profile && (
          <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
            <DocumentsSection
              companyId={profile.id}
              documents={profile.documents}
              canEdit={canEdit}
              onRefresh={handleRefresh}
            />
          </section>
        )}

        {/* Submit for review */}
        {canSubmit && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-1">Submit for verification</h2>
            <p className="text-xs text-zinc-500 mb-4">Make sure your profile is complete and you have added a pending registration certificate before submitting.</p>
            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
            {submitSuccess && <p className="text-sm text-emerald-400 mb-3">Submitted for review successfully.</p>}
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60 transition-colors">
              {isSubmitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
