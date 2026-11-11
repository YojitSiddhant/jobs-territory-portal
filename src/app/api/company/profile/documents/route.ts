import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { assertCompanyEditable, getCurrentCompany } from "@/server/companies/company-profile";
import { companyDocumentSchema } from "@/shared/validation/company";

export async function POST(request: Request) {
  try {
    const user = await requireRole("COMPANY");
    const company = await getCurrentCompany(user.id);
    if (!company) return Response.json({ error: { code: "COMPANY_PROFILE_NOT_FOUND", message: "Create a company profile first." } }, { status: 404 });
    assertCompanyEditable(company);
    const input = companyDocumentSchema.parse(await request.json());
    const prefix = `private/companies/${company.id}/company-document/`;
    if (!input.storageKey.startsWith(prefix)) {
      return Response.json({ error: { code: "INVALID_PRIVATE_REFERENCE", message: "Document reference does not belong to this company." } }, { status: 400 });
    }
    const document = await prisma.verificationDocument.create({ data: { companyId: company.id, type: input.type, storageKey: input.storageKey, originalName: input.originalName, mimeType: input.mimeType, status: "PENDING" } });
    return apiSuccess({ document: { id: document.id, type: document.type, status: document.status, originalName: document.originalName, mimeType: document.mimeType } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
