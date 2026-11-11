import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { AuthorizationError } from "@/server/auth/authorization";

export const companyInclude = { documents: true } as const;
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
    documents: company.documents.map((document) => ({
      id: document.id,
      type: document.type,
      storageKey: document.storageKey,
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
