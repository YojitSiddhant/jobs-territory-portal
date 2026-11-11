export const instant = false;

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getAdminCompany, serializeAdminCompany } from "@/server/admin/company-verification";
import { CompanyDetailClient } from "@/features/admin/components/CompanyDetailClient";
import type { AdminCompany } from "@/features/admin/types";

type PageProps = { params: Promise<{ companyId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { companyId } = await params;
  const company = await getAdminCompany(companyId);
  return { title: `${company?.name ?? "Company"} – Admin – Jobs Territory` };
}

export default async function AdminCompanyDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const { companyId } = await params;
  const raw = await getAdminCompany(companyId);
  if (!raw) notFound();

  const s = serializeAdminCompany(raw);
  const company: AdminCompany = {
    ...s,
    verificationSubmittedAt: s.verificationSubmittedAt instanceof Date ? s.verificationSubmittedAt.toISOString() : (s.verificationSubmittedAt as string | null),
    documents: s.documents.map((d) => ({
      ...d,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : (d.createdAt as string),
    })),
    reviews: s.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as string),
    })),
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : (s.createdAt as string),
    updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : (s.updatedAt as string),
  };

  return <CompanyDetailClient initialCompany={company} />;
}
