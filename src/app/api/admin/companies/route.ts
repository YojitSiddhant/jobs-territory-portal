import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { serializeAdminCompany, adminCompanyInclude } from "@/server/admin/company-verification";

export async function GET(request: Request) {
  try {
    void request.url;
    await requireRole("ADMIN");
    const companies = await prisma.company.findMany({ where: { status: "PENDING", verificationSubmittedAt: { not: null } }, include: adminCompanyInclude, orderBy: { verificationSubmittedAt: "asc" } });
    return apiSuccess({ companies: companies.map(serializeAdminCompany) });
  } catch (error) {
    return apiError(error);
  }
}
