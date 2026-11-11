import { requireRole } from "@/server/auth/authorization";
import { getAdminCompany, reviewCompany, serializeAdminCompany } from "@/server/admin/company-verification";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { reviewReasonSchema } from "@/shared/validation/admin-company";

export async function POST(request: Request, context: { params: Promise<{ companyId: string }> }) {
  try {
    const admin = await requireRole("ADMIN");
    const { companyId } = await context.params;
    const { reason } = reviewReasonSchema.parse(await request.json());
    await reviewCompany(companyId, admin.id, "SUSPENDED", reason);
    const company = await getAdminCompany(companyId);
    return apiSuccess({ company: serializeAdminCompany(company!) });
  } catch (error) {
    return apiError(error);
  }
}
