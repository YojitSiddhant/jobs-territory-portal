import { Prisma } from "@prisma/client";
import { AuthorizationError } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const verificationFields = ["NAME", "REGISTRATION_NUMBER", "WEBSITE", "CONTACT_EMAIL", "PHONE", "ADDRESS", "INDUSTRY", "DESCRIPTION"] as const;
export type VerificationField = (typeof verificationFields)[number];
export type ItemDecision = "VERIFIED" | "REJECTED";

export const adminCompanyInclude = {
  owner: { select: { id: true, email: true, role: true } },
  documents: { include: { itemReviews: { orderBy: { createdAt: "desc" as const }, include: { reviewer: { select: { id: true, email: true } } } } } },
  reviews: { orderBy: { createdAt: "desc" as const }, include: { admin: { select: { id: true, email: true } } } },
  itemReviews: { orderBy: { createdAt: "desc" as const }, include: { reviewer: { select: { id: true, email: true } } } },
} as const;

export type AdminCompany = Prisma.CompanyGetPayload<{ include: typeof adminCompanyInclude }>;

function latest<T extends { createdAt: Date }>(items: T[]) { return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]; }

function fieldValue(company: AdminCompany, field: VerificationField) {
  const values: Record<VerificationField, string | null> = { NAME: company.name, REGISTRATION_NUMBER: company.registrationNumber, WEBSITE: company.website, CONTACT_EMAIL: company.contactEmail, PHONE: company.phone, ADDRESS: company.address, INDUSTRY: company.industry, DESCRIPTION: company.description };
  return values[field];
}

export function currentFieldReview(company: AdminCompany, field: VerificationField) {
  const review = latest(company.itemReviews.filter((item) => item.field === field));
  if (review && company.updatedAt > review.createdAt) return { status: "PENDING" as const, review: null };
  return { status: (review?.decision ?? "PENDING") as "PENDING" | "VERIFIED" | "REJECTED", review: review ?? null };
}

export function currentDocumentReview(document: AdminCompany["documents"][number]) {
  const review = latest(document.itemReviews);
  return { status: (review?.decision ?? "PENDING") as "PENDING" | "VERIFIED" | "REJECTED", review: review ?? null };
}

export function hasRequiredVerificationData(company: { name: string | null; registrationNumber: string | null; website: string | null; contactEmail: string | null; phone: string | null; address: string | null; industry: string | null; description: string | null; documents: Array<{ type: string; status: string }> }) {
  const requiredFields = [company.name, company.registrationNumber, company.website, company.contactEmail, company.phone, company.address, company.industry, company.description];
  return requiredFields.every((field) => Boolean(field?.trim())) && company.documents.some((document) => document.type === "REGISTRATION_CERTIFICATE" && (document.status === "PENDING" || document.status === "VERIFIED"));
}

export function canApproveCompany(company: AdminCompany) {
  return hasRequiredVerificationData(company) && verificationFields.every((field) => currentFieldReview(company, field).status === "VERIFIED") && company.documents.every((document) => currentDocumentReview(document).status === "VERIFIED");
}

export function serializeAdminCompany(company: AdminCompany) {
  const fields = verificationFields.map((field) => { const current = currentFieldReview(company, field); return { field, value: fieldValue(company, field), status: current.status, reason: current.review?.reason ?? null, reviewedAt: current.review?.createdAt ?? null, reviewer: current.review?.reviewer ?? null }; });
  return {
    id: company.id, owner: company.owner, name: company.name, registrationNumber: company.registrationNumber, website: company.website, officialEmail: company.contactEmail, phone: company.phone, address: company.address, industry: company.industry, description: company.description, status: company.status, rejectionReason: company.rejectionReason, verificationSubmittedAt: company.verificationSubmittedAt, fields,
    documents: company.documents.map((document) => { const current = currentDocumentReview(document); return { id: document.id, type: document.type, status: current.status, originalName: document.originalName, mimeType: document.mimeType, rejectionReason: current.review?.reason ?? document.rejectionReason, reviewedAt: current.review?.createdAt ?? null, reviewer: current.review?.reviewer ?? null, createdAt: document.createdAt, previewPath: `/api/admin/companies/${encodeURIComponent(company.id)}/documents/${encodeURIComponent(document.id)}` }; }),
    reviews: company.reviews.map((review) => ({ id: review.id, decision: review.decision, reason: review.reason, createdAt: review.createdAt, admin: review.admin })),
    itemReviewHistory: company.itemReviews.map((review) => ({ id: review.id, field: review.field, documentId: review.documentId, decision: review.decision, reason: review.reason, createdAt: review.createdAt, reviewer: review.reviewer })), canApprove: canApproveCompany(company), createdAt: company.createdAt, updatedAt: company.updatedAt,
  };
}

export async function getAdminCompany(id: string) { return prisma.company.findUnique({ where: { id }, include: adminCompanyInclude }); }

export function assertValidReviewTransition(status: string, decision: "APPROVED" | "REJECTED" | "SUSPENDED" | "RESTORED") {
  const allowed = decision === "APPROVED" || decision === "REJECTED" ? status === "PENDING" : decision === "SUSPENDED" ? status === "APPROVED" : status === "SUSPENDED";
  if (!allowed) throw new AuthorizationError(`Cannot ${decision.toLowerCase()} a company in ${status} status.`);
}

export async function reviewCompany(companyId: string, adminId: string, decision: "APPROVED" | "REJECTED" | "SUSPENDED" | "RESTORED", reason?: string) {
  if (decision === "APPROVED") {
    const reviewable = await getAdminCompany(companyId);
    if (!reviewable) throw Object.assign(new Error("Company was not found."), { status: 404, name: "CompanyNotFoundError" });
    if (!canApproveCompany(reviewable)) throw Object.assign(new Error("All required fields and documents must be individually verified before approval."), { status: 400, name: "VerificationDataIncompleteError" });
  }
  return prisma.$transaction(async (tx) => {
    const company = await tx.company.findUnique({ where: { id: companyId }, include: { documents: true } });
    if (!company) throw Object.assign(new Error("Company was not found."), { status: 404, name: "CompanyNotFoundError" });
    assertValidReviewTransition(company.status, decision);
    const nextStatus = decision === "RESTORED" ? "APPROVED" : decision;
    const updated = await tx.company.update({ where: { id: companyId }, data: { status: nextStatus, rejectionReason: decision === "REJECTED" || decision === "SUSPENDED" ? reason : null }, include: adminCompanyInclude });
    await tx.adminReviewRecord.create({ data: { adminId, companyId, decision, reason: reason ?? null } });
    return updated;
  });
}

export async function reviewCompanyField(companyId: string, reviewerId: string, field: VerificationField, decision: ItemDecision, reason?: string) {
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
  if (!company) throw Object.assign(new Error("Company was not found."), { status: 404, name: "CompanyNotFoundError" });
  await prisma.companyVerificationItemReview.create({ data: { companyId, reviewerId, field, decision, reason: reason ?? null } });
  return getAdminCompany(companyId);
}

export async function reviewCompanyDocument(companyId: string, documentId: string, reviewerId: string, decision: ItemDecision, reason?: string) {
  const document = await prisma.verificationDocument.findFirst({ where: { id: documentId, companyId } });
  if (!document) throw Object.assign(new Error("Document was not found."), { status: 404, name: "DocumentNotFoundError" });
  await prisma.$transaction([prisma.companyVerificationItemReview.create({ data: { companyId, documentId, reviewerId, decision, reason: reason ?? null } }), prisma.verificationDocument.update({ where: { id: documentId }, data: { status: decision, rejectionReason: reason ?? null } })]);
  return getAdminCompany(companyId);
}
