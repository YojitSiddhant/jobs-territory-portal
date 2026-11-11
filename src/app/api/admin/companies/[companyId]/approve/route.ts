import { requireRole } from "@/server/auth/authorization";
import { getAdminCompany, reviewCompany, serializeAdminCompany } from "@/server/admin/company-verification";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";

export async function POST(_request: Request, context: { params: Promise<{ companyId: string }> }) {
  try {
    const admin = await requireRole("ADMIN");
    const { companyId } = await context.params;
    await reviewCompany(companyId, admin.id, "APPROVED");
    const company = await getAdminCompany(companyId);
    return apiSuccess({ company: serializeAdminCompany(company!) });
  } catch (error) {
    return apiError(error);
  }
}
