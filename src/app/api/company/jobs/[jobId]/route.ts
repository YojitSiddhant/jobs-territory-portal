import { requireRole } from "@/server/auth/authorization";
import { requireApprovedCompany } from "@/server/companies/company-profile";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { getOwnedJob, serializeJob, jobSelect } from "@/server/jobs/job-management";
import { prisma } from "@/server/db/prisma";
import { jobUpdateSchema } from "@/shared/validation/job";

export async function GET(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("COMPANY");
    const company = await requireApprovedCompany(user.id);
    const { jobId } = await context.params;
    const job = await getOwnedJob(company.id, jobId);
    if (!job) return Response.json({ error: { code: "JOB_NOT_FOUND", message: "Job was not found." } }, { status: 404 });
    return apiSuccess({ job: serializeJob(job) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("COMPANY");
    const company = await requireApprovedCompany(user.id);
    const { jobId } = await context.params;
    const current = await getOwnedJob(company.id, jobId);
    if (!current) return Response.json({ error: { code: "JOB_NOT_FOUND", message: "Job was not found." } }, { status: 404 });
    if (current.status !== "DRAFT") return Response.json({ error: { code: "JOB_STATUS_LOCKED", message: "Only draft jobs can be edited." } }, { status: 409 });
    const input = jobUpdateSchema.parse(await request.json());
    const job = await prisma.job.update({ where: { id: current.id }, data: {
      ...(input.title !== undefined ? { title: input.title } : {}), ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}), ...(input.workplaceType !== undefined ? { workplaceType: input.workplaceType } : {}),
      ...(input.employmentType !== undefined ? { employmentType: input.employmentType } : {}), ...(input.experienceRequirement !== undefined ? { experienceRequirement: input.experienceRequirement } : {}),
      ...(input.requiredSkills !== undefined ? { requiredSkills: input.requiredSkills } : {}), ...(input.salaryMin !== undefined ? { salaryMin: input.salaryMin } : {}),
      ...(input.salaryMax !== undefined ? { salaryMax: input.salaryMax } : {}), ...(input.applicationDeadline !== undefined ? { applicationDeadline: input.applicationDeadline } : {}),
    }, select: jobSelect });
    return apiSuccess({ job: serializeJob(job) });
  } catch (error) {
    return apiError(error);
  }
}
