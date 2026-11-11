import { Prisma } from "@prisma/client";
import { AuthorizationError } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const adminCompanyInclude = {
  owner: { select: { id: true, email: true, role: true } },
  documents: true,
  reviews: { orderBy: { createdAt: "desc" as const }, include: { admin: { select: { id: true, email: true } } } },
} as const;

export type AdminCompany = Prisma.CompanyGetPayload<{ include: typeof adminCompanyInclude }>;

type VerificationData = {
  name: string | null;
  registrationNumber: string | null;
  website: string | null;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  industry: string | null;
  description: string | null;
  documents: Array<{ type: string; status: string }>;
};

export function hasRequiredVerificationData(company: VerificationData) {
  const requiredFields = [company.name, company.registrationNumber, company.website, company.contactEmail, company.phone, company.address, company.industry, company.description];
  return requiredFields.every((field) => Boolean(field?.trim())) && company.documents.some((document) => document.type === "REGISTRATION_CERTIFICATE" && document.status === "PENDING");
}

export function serializeAdminCompany(company: AdminCompany) {
  return {
    id: company.id,
    owner: company.owner,
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
      status: document.status,
      originalName: document.originalName,
      mimeType: document.mimeType,
      storageKey: document.storageKey,
      rejectionReason: document.rejectionReason,
      createdAt: document.createdAt,
    })),
    reviews: company.reviews.map((review) => ({
      id: review.id,
      decision: review.decision,
      reason: review.reason,
      createdAt: review.createdAt,
      admin: review.admin,
    })),
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

export async function getAdminCompany(id: string) {
  return prisma.company.findUnique({ where: { id }, include: adminCompanyInclude });
}

export function assertValidReviewTransition(status: string, decision: "APPROVED" | "REJECTED" | "SUSPENDED" | "RESTORED") {
  const allowed = decision === "APPROVED" || decision === "REJECTED" ? status === "PENDING" : decision === "SUSPENDED" ? status === "APPROVED" : status === "SUSPENDED";
  if (!allowed) throw new AuthorizationError(`Cannot ${decision.toLowerCase()} a company in ${status} status.`);
}

export async function reviewCompany(companyId: string, adminId: string, decision: "APPROVED" | "REJECTED" | "SUSPENDED" | "RESTORED", reason?: string) {
  return prisma.$transaction(async (tx) => {
    const company = await tx.company.findUnique({ where: { id: companyId }, include: { documents: true } });
    if (!company) throw Object.assign(new Error("Company was not found."), { status: 404, name: "CompanyNotFoundError" });

    assertValidReviewTransition(company.status, decision);
    if (decision === "APPROVED") {
      if (!hasRequiredVerificationData(company)) throw Object.assign(new Error("Complete company data and a pending registration proof are required for approval."), { status: 400, name: "VerificationDataIncompleteError" });
    }

    const nextStatus = decision === "RESTORED" ? "APPROVED" : decision;
    const updated = await tx.company.update({ where: { id: companyId }, data: { status: nextStatus, rejectionReason: decision === "REJECTED" || decision === "SUSPENDED" ? reason : null }, include: adminCompanyInclude });
    await tx.adminReviewRecord.create({ data: { adminId, companyId, decision, reason: reason ?? null } });
    return updated;
  });
}
