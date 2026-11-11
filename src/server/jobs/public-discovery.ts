import { prisma } from "@/server/db/prisma";

export const publicJobSelect = {
  id: true, slug: true, title: true, description: true, location: true, workplaceType: true, employmentType: true, experienceRequirement: true,
  requiredSkills: true, salaryMin: true, salaryMax: true, applicationDeadline: true, publishedAt: true, createdAt: true, updatedAt: true,
  company: { select: { id: true, name: true, slug: true, industry: true, website: true } },
} as const;

export type PublicJob = Awaited<ReturnType<typeof getPublicJob>>;

export function isDiscoverableJob(status: string, companyStatus: string, applicationDeadline: Date | null, now = new Date()) {
  return status === "PUBLISHED" && companyStatus === "APPROVED" && (applicationDeadline === null || applicationDeadline >= now);
}

export async function getPublicJob(slug: string) {
  return prisma.job.findFirst({ where: { slug, status: "PUBLISHED", OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }], company: { status: "APPROVED" } }, select: publicJobSelect });
}

export function serializePublicJob(job: NonNullable<PublicJob>) {
  return { ...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [] };
}
