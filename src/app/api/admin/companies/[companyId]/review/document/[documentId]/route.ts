import { requireRole } from "@/server/auth/authorization";
import { getAdminCompany, reviewCompanyDocument, serializeAdminCompany } from "@/server/admin/company-verification";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { itemReviewSchema } from "@/shared/validation/admin-company";

export async function POST(request: Request, { params }: { params: Promise<{ companyId: string; documentId: string }> }) {
  try {
    const admin = await requireRole("ADMIN");
    const { companyId, documentId } = await params;
    const input = itemReviewSchema.parse(await request.json());
    await reviewCompanyDocument(companyId, documentId, admin.id, input.decision, input.reason);
    const company = await getAdminCompany(companyId);
    return apiSuccess({ company: serializeAdminCompany(company!) });
  } catch (error) { return apiError(error); }
}
