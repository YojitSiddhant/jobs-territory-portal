export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { adminCompanyInclude, normalizeCompanyListStatus, serializeAdminCompany } from "@/server/admin/company-verification";
import { CompanyListClient } from "@/features/admin/components/CompanyListClient";
import type { AdminCompany } from "@/features/admin/types";

export const metadata: Metadata = { title: "Companies – Admin – Jobs Territory" };

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminCompaniesPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const rawStatus = (await searchParams).status;
  const status = normalizeCompanyListStatus(Array.isArray(rawStatus) ? rawStatus[0] : rawStatus);

  const raw = await prisma.company.findMany({
    where: { status, ...(status === "PENDING" ? { verificationSubmittedAt: { not: null } } : {}) },
    include: adminCompanyInclude,
    orderBy: status === "PENDING" ? { verificationSubmittedAt: "asc" } : { updatedAt: "desc" },
  });

  const companies: AdminCompany[] = raw.map((c) => {
    const s = serializeAdminCompany(c);
    return {
      ...s,
      verificationSubmittedAt: s.verificationSubmittedAt instanceof Date ? s.verificationSubmittedAt.toISOString() : (s.verificationSubmittedAt as string | null),
      documents: s.documents.map((d) => ({
        ...d,
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : (d.createdAt as string),
        reviewedAt: d.reviewedAt instanceof Date ? d.reviewedAt.toISOString() : (d.reviewedAt as string | null),
      })),
      fields: s.fields.map((field) => ({ ...field, reviewedAt: field.reviewedAt instanceof Date ? field.reviewedAt.toISOString() : field.reviewedAt })),
      itemReviewHistory: s.itemReviewHistory.map((review) => ({ ...review, createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt })),
      reviews: s.reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as string),
      })),
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : (s.createdAt as string),
      updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : (s.updatedAt as string),
    };
  });

  return <CompanyListClient initialCompanies={companies} initialStatus={status} />;
}
