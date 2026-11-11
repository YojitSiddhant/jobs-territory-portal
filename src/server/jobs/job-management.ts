import type { Prisma } from "@prisma/client";
import { AuthorizationError } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const jobSelect = {
  id: true, companyId: true, slug: true, title: true, description: true, location: true,
  workplaceType: true, employmentType: true, experienceRequirement: true, requiredSkills: true,
  salaryMin: true, salaryMax: true, applicationDeadline: true, status: true,
  publishedAt: true, createdAt: true, updatedAt: true,
} as const;
export type JobRecord = Prisma.JobGetPayload<{ select: typeof jobSelect }>;

export function slugifyJob(title: string, id: string) {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "job";
  return `${base}-${id.slice(-8)}`;
}

export function serializeJob(job: JobRecord) {
  return { ...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [] };
}

export function assertJobTransition(status: string, action: "PUBLISH" | "CLOSE") {
  if (action === "PUBLISH" && status !== "DRAFT") throw new AuthorizationError("Only draft jobs can be published.");
  if (action === "CLOSE" && status !== "PUBLISHED") throw new AuthorizationError("Only published jobs can be closed.");
}

export function isPublicJob(status: string, applicationDeadline: Date | null, now = new Date()) {
  return status === "PUBLISHED" && (applicationDeadline === null || applicationDeadline >= now);
}

export async function getOwnedJob(companyId: string, jobId: string) {
  return prisma.job.findFirst({ where: { id: jobId, companyId }, select: jobSelect });
}
