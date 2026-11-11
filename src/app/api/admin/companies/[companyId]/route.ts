import { requireRole } from "@/server/auth/authorization";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { getAdminCompany, serializeAdminCompany } from "@/server/admin/company-verification";

export async function GET(_request: Request, context: { params: Promise<{ companyId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { companyId } = await context.params;
    const company = await getAdminCompany(companyId);
    if (!company) return Response.json({ error: { code: "COMPANY_NOT_FOUND", message: "Company was not found." } }, { status: 404 });
    return apiSuccess({ company: serializeAdminCompany(company) });
  } catch (error) {
    return apiError(error);
  }
}
