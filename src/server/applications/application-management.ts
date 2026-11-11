import type { ApplicationStatus, Prisma } from "@prisma/client";
import { AuthorizationError } from "@/server/auth/authorization";

export const applicationSelect = {
  id: true, jobId: true, candidateId: true, resumeKey: true, coverNote: true, status: true,
  createdAt: true, updatedAt: true,
  job: { select: { id: true, slug: true, title: true, companyId: true, company: { select: { name: true, slug: true } } } },
  candidate: { select: { id: true, candidateProfile: { select: { fullName: true, headline: true, location: true } } } },
  statusHistory: { orderBy: { createdAt: "asc" as const }, select: { status: true, createdAt: true, actor: { select: { role: true } } } },
} as const;
export type ApplicationRecord = Prisma.ApplicationGetPayload<{ select: typeof applicationSelect }>;

export function isApplyableJob(job: { status: string; applicationDeadline: Date | null; companyStatus: string }, now = new Date()) {
  return job.status === "PUBLISHED" && job.companyStatus === "APPROVED" && (job.applicationDeadline === null || job.applicationDeadline >= now);
}

export function hasUsableCandidateProfile(profile: { fullName: string | null; resumeKey: string | null } | null) {
  return Boolean(profile?.fullName?.trim() && profile.resumeKey?.trim());
}

export function assertApplicationTransition(current: ApplicationStatus, next: ApplicationStatus) {
  const allowed: Record<ApplicationStatus, ApplicationStatus[]> = {
    APPLIED: ["REVIEWING", "REJECTED"],
    REVIEWING: ["SHORTLISTED", "REJECTED"],
    SHORTLISTED: ["HIRED", "REJECTED"],
    REJECTED: [], HIRED: [], WITHDRAWN: [],
  };
  if (!allowed[current].includes(next)) throw new AuthorizationError(`Cannot change application status from ${current} to ${next}.`);
}

export function serializeApplication(application: ApplicationRecord) {
  return {
    id: application.id, status: application.status, coverNote: application.coverNote,
    resumeReferenceAvailable: Boolean(application.resumeKey), createdAt: application.createdAt, updatedAt: application.updatedAt,
    job: application.job,
    candidate: application.candidate.candidateProfile,
    statusHistory: application.statusHistory.map((entry) => ({ status: entry.status, createdAt: entry.createdAt, actorRole: entry.actor.role })),
  };
}
