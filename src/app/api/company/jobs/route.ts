import { Prisma } from "@prisma/client";
import { requireRole } from "@/server/auth/authorization";
import { requireApprovedCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { jobCreateSchema } from "@/shared/validation/job";
import { serializeJob, slugifyJob, jobSelect } from "@/server/jobs/job-management";

export async function GET() {
  try {
    const user = await requireRole("COMPANY");
    const company = await requireApprovedCompany(user.id);
    const jobs = await prisma.job.findMany({ where: { companyId: company.id }, select: jobSelect, orderBy: { createdAt: "desc" } });
    return apiSuccess({ jobs: jobs.map(serializeJob) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("COMPANY");
    const company = await requireApprovedCompany(user.id);
    const input = jobCreateSchema.parse(await request.json());
    const job = await prisma.$transaction(async (tx) => {
      const created = await tx.job.create({ data: {
        companyId: company.id, title: input.title, description: input.description, location: input.location ?? null,
        workplaceType: input.workplaceType, employmentType: input.employmentType, experienceRequirement: input.experienceRequirement,
        requiredSkills: input.requiredSkills, salaryMin: input.salaryMin ?? null, salaryMax: input.salaryMax ?? null,
        applicationDeadline: input.applicationDeadline ?? null, status: "DRAFT",
      }, select: { id: true } });
      return tx.job.update({ where: { id: created.id }, data: { slug: slugifyJob(input.title, created.id) }, select: jobSelect });
    });
    return apiSuccess({ job: serializeJob(job) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: { code: "JOB_SLUG_ALREADY_EXISTS", message: "A job with this identifier already exists." } }, { status: 409 });
    return apiError(error);
  }
}
