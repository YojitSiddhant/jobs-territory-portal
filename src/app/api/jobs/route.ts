import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { normalizeDiscoveryQuery } from "@/shared/validation/job-discovery";
import { publicJobSelect, serializePublicJob } from "@/server/jobs/public-discovery";

export async function GET(request: Request) {
  try {
    const query = normalizeDiscoveryQuery(new URL(request.url).searchParams);
    const now = new Date();
    const andFilters: Prisma.JobWhereInput[] = [{ OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: now } }] }];
    if (query.q) andFilters.push({ OR: [{ title: { contains: query.q } }, { description: { contains: query.q } }, { company: { name: { contains: query.q } } }, { requiredSkills: { string_contains: query.q } }] });
    if (query.company) andFilters.push({ company: { is: { OR: [{ id: query.company }, { name: { contains: query.company } }] } } });
    if (query.salaryMin !== undefined) andFilters.push({ OR: [{ salaryMax: null }, { salaryMax: { gte: query.salaryMin } }] });
    if (query.salaryMax !== undefined) andFilters.push({ OR: [{ salaryMin: null }, { salaryMin: { lte: query.salaryMax } }] });
    const where: Prisma.JobWhereInput = {
      status: "PUBLISHED", company: { status: "APPROVED" }, AND: andFilters,
      ...(query.location ? { location: { contains: query.location } } : {}), ...(query.workplaceType ? { workplaceType: query.workplaceType } : {}),
      ...(query.employmentType ? { employmentType: query.employmentType } : {}), ...(query.experience ? { experienceRequirement: { contains: query.experience } } : {}),
      ...(query.skill ? { requiredSkills: { string_contains: query.skill } } : {}),
    };
    const orderBy = query.sort === "deadline" ? [{ applicationDeadline: "asc" as const }, { publishedAt: "desc" as const }] : [{ publishedAt: "desc" as const }];
    const [total, jobs] = await prisma.$transaction([
      prisma.job.count({ where }),
      prisma.job.findMany({ where, select: publicJobSelect, orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    ]);
    return apiSuccess({ jobs: jobs.map(serializePublicJob), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } });
  } catch (error) {
    return apiError(error);
  }
}
