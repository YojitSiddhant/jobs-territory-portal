import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { serializeAdminCompany, adminCompanyInclude, normalizeCompanyListStatus } from "@/server/admin/company-verification";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");
    const status = normalizeCompanyListStatus(new URL(request.url).searchParams.get("status"));
    const companies = await prisma.company.findMany({
      where: { status, ...(status === "PENDING" ? { verificationSubmittedAt: { not: null } } : {}) },
      include: adminCompanyInclude,
      orderBy: status === "PENDING" ? { verificationSubmittedAt: "asc" } : { updatedAt: "desc" },
    });
    return apiSuccess({ companies: companies.map(serializeAdminCompany), status });
  } catch (error) {
    return apiError(error);
  }
}
