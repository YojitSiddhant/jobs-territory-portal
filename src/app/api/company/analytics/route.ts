import { requireRole } from "@/server/auth/authorization";
import { requireApprovedCompany } from "@/server/companies/company-profile";
import { getCompanyAnalytics } from "@/server/companies/company-analytics";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";

/** Returns bounded analytics for the authenticated company's jobs and applications. */
export async function GET() {
  try {
    const user = await requireRole("COMPANY");
    const company = await requireApprovedCompany(user.id);
    return apiSuccess({ analytics: await getCompanyAnalytics(company.id) });
  } catch (error) {
    return apiError(error);
  }
}
