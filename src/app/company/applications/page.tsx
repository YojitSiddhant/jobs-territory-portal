export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { applicationSelect, serializeApplication } from "@/server/applications/application-management";
import { getCurrentCompany } from "@/server/companies/company-profile";
import { CompanyApplicationsClient } from "@/features/companies/components/CompanyApplicationsClient";
import type { CompanyApplication } from "@/features/companies/types";

export const metadata: Metadata = { title: "Applications – Jobs Territory" };

export default async function CompanyApplicationsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "COMPANY") redirect("/");

  const company = await getCurrentCompany(user.id);
  if (!company || company.status !== "APPROVED") redirect("/company/dashboard");

  const raw = await prisma.application.findMany({
    where: { job: { companyId: company.id } },
    select: applicationSelect,
    orderBy: { createdAt: "desc" },
  });

  const applications: CompanyApplication[] = raw.map((a) => {
    const s = serializeApplication(a);
    return {
      id: s.id,
      status: s.status,
      coverNote: s.coverNote,
      resumeReferenceAvailable: s.resumeReferenceAvailable,
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : (s.createdAt as string),
      updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : (s.updatedAt as string),
      job: { ...s.job, slug: s.job.slug ?? null },
      candidate: s.candidate,
      statusHistory: s.statusHistory.map((h) => ({
        status: h.status,
        createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : (h.createdAt as string),
        actorRole: h.actorRole,
      })),
    };
  });

  return <CompanyApplicationsClient initialApplications={applications} />;
}
