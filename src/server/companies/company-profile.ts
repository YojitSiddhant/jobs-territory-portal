import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { AuthorizationError } from "@/server/auth/authorization";

export const companyInclude = { documents: true, itemReviews: { orderBy: { createdAt: "desc" as const } } } as const;
export type CompanyWithDocuments = Prisma.CompanyGetPayload<{ include: typeof companyInclude }>;

export async function getCurrentCompany(ownerId: string) {
  return prisma.company.findUnique({ where: { ownerId }, include: companyInclude });
}

export function assertCompanyEditable(company: { status: string }) {
  if (company.status !== "PENDING" && company.status !== "REJECTED") {
    throw new AuthorizationError("Approved or suspended company profiles require admin action before changes.");
  }
}

export function isApprovedCompanyStatus(status: string) {
  return status === "APPROVED";
}

export async function requireApprovedCompany(ownerId: string) {
  const company = await getCurrentCompany(ownerId);
  if (!company || !isApprovedCompanyStatus(company.status)) {
    throw new AuthorizationError("Company approval is required before managing jobs.");
  }
  return company;
}

export function companyResponse(company: CompanyWithDocuments) {
  const fields = ["NAME", "REGISTRATION_NUMBER", "WEBSITE", "CONTACT_EMAIL", "PHONE", "ADDRESS", "INDUSTRY", "DESCRIPTION"] as const;
  const values = { NAME: company.name, REGISTRATION_NUMBER: company.registrationNumber, WEBSITE: company.website, CONTACT_EMAIL: company.contactEmail, PHONE: company.phone, ADDRESS: company.address, INDUSTRY: company.industry, DESCRIPTION: company.description };
  return {
    id: company.id,
    name: company.name,
    registrationNumber: company.registrationNumber,
    website: company.website,
    officialEmail: company.contactEmail,
    phone: company.phone,
    address: company.address,
    industry: company.industry,
    description: company.description,
    status: company.status,
    rejectionReason: company.rejectionReason,
    verificationSubmittedAt: company.verificationSubmittedAt,
    verificationFields: fields.map((field) => {
      const review = company.itemReviews.find((item) => item.field === field);
      return { field, status: review?.decision ?? "PENDING", reason: review?.reason ?? null, reviewedAt: review?.createdAt ?? null, value: values[field] };
    }),
    documents: company.documents.map((document) => ({
      id: document.id,
      type: document.type,
      originalName: document.originalName,
      mimeType: document.mimeType,
      status: document.status,
      rejectionReason: document.rejectionReason,
      createdAt: document.createdAt,
    })),
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}
