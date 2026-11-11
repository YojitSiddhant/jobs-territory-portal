import { requireRole } from "@/server/auth/authorization";
import { requireApprovedCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { applicationSelect, serializeApplication } from "@/server/applications/application-management";

export async function GET() {
  try {
    const user = await requireRole("COMPANY"); const company = await requireApprovedCompany(user.id);
    const applications = await prisma.application.findMany({ where: { job: { companyId: company.id } }, select: applicationSelect, orderBy: { createdAt: "desc" } });
    return apiSuccess({ applications: applications.map(serializeApplication) });
  } catch (error) { return apiError(error); }
}
