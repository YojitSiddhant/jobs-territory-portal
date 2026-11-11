export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { jobSelect, serializeJob } from "@/server/jobs/job-management";
import { getCurrentCompany } from "@/server/companies/company-profile";
import { JobsManagementClient } from "@/features/companies/components/JobsManagementClient";
import type { CompanyJob } from "@/features/companies/types";

export const metadata: Metadata = { title: "Job Management – Jobs Territory" };

export default async function CompanyJobsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "COMPANY") redirect("/");

  const company = await getCurrentCompany(user.id);
  if (!company || company.status !== "APPROVED") redirect("/company/dashboard");

  const rawJobs = await prisma.job.findMany({
    where: { companyId: company.id },
    select: jobSelect,
    orderBy: { createdAt: "desc" },
  });

  const jobs: CompanyJob[] = rawJobs.map((j) => {
    const s = serializeJob(j);
    return {
      id: s.id, companyId: s.companyId, slug: s.slug ?? null,
      title: s.title, description: s.description, location: s.location,
      workplaceType: s.workplaceType, employmentType: s.employmentType,
      experienceRequirement: s.experienceRequirement,
      requiredSkills: s.requiredSkills as string[],
      salaryMin: s.salaryMin !== null ? Number(s.salaryMin) : null,
      salaryMax: s.salaryMax !== null ? Number(s.salaryMax) : null,
      applicationDeadline: s.applicationDeadline instanceof Date ? s.applicationDeadline.toISOString() : (s.applicationDeadline as string | null),
      status: s.status as CompanyJob["status"],
      publishedAt: s.publishedAt instanceof Date ? s.publishedAt.toISOString() : (s.publishedAt as string | null),
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : (s.createdAt as string),
      updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : (s.updatedAt as string),
    };
  });

  return <JobsManagementClient initialJobs={jobs} />;
}
