import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { companyInclude, companyResponse, getCurrentCompany } from "@/server/companies/company-profile";
import { companyProfileSchema } from "@/shared/validation/company";

export async function POST() {
  try {
    const user = await requireRole("COMPANY");
    const company = await getCurrentCompany(user.id);
    if (!company) return Response.json({ error: { code: "COMPANY_PROFILE_NOT_FOUND", message: "Create a company profile first." } }, { status: 404 });
    if (company.status === "APPROVED" || company.status === "SUSPENDED") return Response.json({ error: { code: "COMPANY_STATUS_LOCKED", message: "This company status can only be changed by an administrator." } }, { status: 409 });
    companyProfileSchema.parse({ name: company.name, registrationNumber: company.registrationNumber, website: company.website, officialEmail: company.contactEmail, phone: company.phone, address: company.address, industry: company.industry, description: company.description });
    if (!company.documents.some((document) => document.type === "REGISTRATION_CERTIFICATE" && (document.status === "PENDING" || document.status === "VERIFIED"))) {
      return Response.json({ error: { code: "REGISTRATION_PROOF_REQUIRED", message: "Add a registration proof document before submitting for review." } }, { status: 400 });
    }
    const updated = await prisma.company.update({ where: { id: company.id }, data: { status: "PENDING", rejectionReason: null, verificationSubmittedAt: new Date() }, include: companyInclude });
    return apiSuccess({ company: companyResponse(updated) });
  } catch (error) {
    return apiError(error);
  }
}
