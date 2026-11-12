import { requireRole } from "@/server/auth/authorization";
import { getAdminCompany, reviewCompanyField, serializeAdminCompany } from "@/server/admin/company-verification";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { itemReviewSchema, verificationFieldSchema } from "@/shared/validation/admin-company";

export async function POST(request: Request, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const admin = await requireRole("ADMIN");
    const { companyId } = await params;
    const body = await request.json();
    const field = verificationFieldSchema.parse(body.field);
    const input = itemReviewSchema.parse(body);
    await reviewCompanyField(companyId, admin.id, field, input.decision, input.reason);
    const company = await getAdminCompany(companyId);
    return apiSuccess({ company: serializeAdminCompany(company!) });
  } catch (error) { return apiError(error); }
}
