import { requireRole } from "@/server/auth/authorization";
import { requireApprovedCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { applicationSelect, serializeApplication } from "@/server/applications/application-management";

export async function GET(_request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const user = await requireRole("COMPANY"); const company = await requireApprovedCompany(user.id); const { applicationId } = await params;
    const application = await prisma.application.findFirst({ where: { id: applicationId, job: { companyId: company.id } }, select: applicationSelect });
    if (!application) return Response.json({ error: { code: "APPLICATION_NOT_FOUND", message: "Application not found." } }, { status: 404 });
    return apiSuccess({ application: serializeApplication(application) });
  } catch (error) { return apiError(error); }
}
