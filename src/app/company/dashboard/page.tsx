export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getCurrentCompany } from "@/server/companies/company-profile";
import { CompanyDashboardClient } from "@/features/companies/components/CompanyDashboardClient";
import type { CompanyProfile } from "@/features/companies/types";

export const metadata: Metadata = { title: "Company Dashboard – Jobs Territory" };

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "COMPANY") redirect("/");

  const raw = await getCurrentCompany(user.id);

  const profile: CompanyProfile | null = raw
    ? {
        id: raw.id,
        name: raw.name ?? "",
        registrationNumber: raw.registrationNumber ?? "",
        website: raw.website ?? "",
        officialEmail: raw.contactEmail ?? "",
        phone: raw.phone ?? "",
        address: raw.address ?? "",
        industry: raw.industry ?? "",
        description: raw.description ?? "",
        status: raw.status as CompanyProfile["status"],
        rejectionReason: raw.rejectionReason,
        verificationSubmittedAt: raw.verificationSubmittedAt?.toISOString() ?? null,
        documents: raw.documents.map((d) => ({
          id: d.id, type: d.type as CompanyProfile["documents"][number]["type"],
          storageKey: d.storageKey, originalName: d.originalName,
          mimeType: d.mimeType, status: d.status as CompanyProfile["documents"][number]["status"],
          rejectionReason: d.rejectionReason,
          createdAt: d.createdAt.toISOString(),
        })),
        createdAt: raw.createdAt.toISOString(),
        updatedAt: raw.updatedAt.toISOString(),
      }
    : null;

  return <CompanyDashboardClient initialProfile={profile} />;
}
