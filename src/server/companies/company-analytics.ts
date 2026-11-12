import type { ApplicationStatus, JobStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

const RECENT_LIMIT = 10;

const applicationStatusOrder: ApplicationStatus[] = [
  "APPLIED", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED", "WITHDRAWN",
];

const jobStatusOrder: JobStatus[] = ["DRAFT", "PUBLISHED", "CLOSED"];

export function countsByStatus<T extends string>(rows: Array<{ status: T; _count: { _all: number } }>, statuses: T[]) {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<T, number>;
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

export async function getCompanyAnalytics(companyId: string) {
  const [jobStatusGroups, applicationStatusGroups, totalApplications, applicationsPerJob, publishedJobs, recentApplications, recentJobs, recentStatusChanges] = await Promise.all([
    prisma.job.groupBy({ where: { companyId, status: { in: jobStatusOrder } }, by: ["status"], _count: { _all: true } }),
    prisma.application.groupBy({ where: { job: { companyId } }, by: ["status"], _count: { _all: true } }),
    prisma.application.count({ where: { job: { companyId } } }),
    prisma.application.groupBy({ where: { job: { companyId } }, by: ["jobId"], _count: { _all: true } }),
    prisma.job.findMany({
      where: { companyId, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: RECENT_LIMIT,
      select: { id: true, title: true, slug: true, publishedAt: true, _count: { select: { applications: true } } },
    }),
    prisma.application.findMany({
      where: { job: { companyId } }, orderBy: { createdAt: "desc" }, take: RECENT_LIMIT,
      select: { id: true, jobId: true, status: true, createdAt: true, updatedAt: true, job: { select: { title: true, slug: true } } },
    }),
    prisma.job.findMany({
      where: { companyId }, orderBy: { updatedAt: "desc" }, take: RECENT_LIMIT,
      select: { id: true, title: true, status: true, createdAt: true, updatedAt: true, publishedAt: true },
    }),
    prisma.applicationStatusHistory.findMany({
      where: { application: { job: { companyId } } }, orderBy: { createdAt: "desc" }, take: RECENT_LIMIT,
      select: { applicationId: true, status: true, createdAt: true },
    }),
  ]);

  return {
    jobs: {
      total: jobStatusGroups.reduce((total, row) => total + row._count._all, 0),
      byStatus: countsByStatus(jobStatusGroups, jobStatusOrder),
    },
    applications: {
      total: totalApplications,
      byStatus: countsByStatus(applicationStatusGroups, applicationStatusOrder),
      perJob: applicationsPerJob.map((row) => ({ jobId: row.jobId, count: row._count._all })),
    },
    publishedJobs: publishedJobs.map((job) => ({ id: job.id, title: job.title, slug: job.slug, publishedAt: job.publishedAt, applicationCount: job._count.applications })),
    recentApplications: recentApplications.map((application) => ({
      id: application.id, jobId: application.jobId, jobTitle: application.job.title, jobSlug: application.job.slug,
      status: application.status, createdAt: application.createdAt, updatedAt: application.updatedAt,
    })),
    recentJobActivity: recentJobs.map((job) => ({ id: job.id, title: job.title, status: job.status, createdAt: job.createdAt, updatedAt: job.updatedAt, publishedAt: job.publishedAt })),
    recentStatusActivity: recentStatusChanges,
    conversion: {
      applications: totalApplications,
      shortlisted: applicationStatusGroups.find((row) => row.status === "SHORTLISTED")?._count._all ?? 0,
      hired: applicationStatusGroups.find((row) => row.status === "HIRED")?._count._all ?? 0,
    },
  };
}

export type CompanyAnalytics = Prisma.PromiseReturnType<typeof getCompanyAnalytics>;
