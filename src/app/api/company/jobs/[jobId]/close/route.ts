import { requireRole } from "@/server/auth/authorization";
import { requireApprovedCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { assertJobTransition, getOwnedJob, serializeJob, jobSelect } from "@/server/jobs/job-management";

export async function POST(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("COMPANY");
    const company = await requireApprovedCompany(user.id);
    const { jobId } = await context.params;
    const current = await getOwnedJob(company.id, jobId);
    if (!current) return Response.json({ error: { code: "JOB_NOT_FOUND", message: "Job was not found." } }, { status: 404 });
    assertJobTransition(current.status, "CLOSE");
    const job = await prisma.job.update({ where: { id: current.id }, data: { status: "CLOSED" }, select: jobSelect });
    return apiSuccess({ job: serializeJob(job) });
  } catch (error) {
    return apiError(error);
  }
}
