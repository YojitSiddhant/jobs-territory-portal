import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { assertCompanyEditable, getCurrentCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { getPrivateStorage } from "@/server/storage/private-storage";

export async function DELETE(_request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const company = user.role === "COMPANY" ? await getCurrentCompany(user.id) : null;
    if (user.role !== "ADMIN" && !company) return Response.json({ error: { code: "COMPANY_PROFILE_NOT_FOUND", message: "Company profile not found." } }, { status: 404 });
    if (company) assertCompanyEditable(company);
    const document = await prisma.verificationDocument.findFirst({ where: { id: (await params).documentId, ...(company ? { companyId: company.id } : {}) }, select: { id: true, storageKey: true } });
    if (!document) return Response.json({ error: { code: "DOCUMENT_NOT_FOUND", message: "Document not found." } }, { status: 404 });
    await prisma.verificationDocument.delete({ where: { id: document.id } });
    await getPrivateStorage().delete(document.storageKey);
    return apiSuccess({ removed: true });
  } catch (error) { return apiError(error); }
}
