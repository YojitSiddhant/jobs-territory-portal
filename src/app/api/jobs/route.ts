import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { normalizeDiscoveryQuery } from "@/shared/validation/job-discovery";
import { buildDiscoveryOrderBy, buildDiscoveryWhere, publicJobSelect, serializePublicJob } from "@/server/jobs/public-discovery";

export async function GET(request: Request) {
  try {
    const query = normalizeDiscoveryQuery(new URL(request.url).searchParams);
    const where = buildDiscoveryWhere(query, new Date());
    const orderBy = buildDiscoveryOrderBy(query.sort);
    const [total, jobs] = await prisma.$transaction([
      prisma.job.count({ where }),
      prisma.job.findMany({ where, select: publicJobSelect, orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    ]);
    return apiSuccess({ jobs: jobs.map(serializePublicJob), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } });
  } catch (error) {
    return apiError(error);
  }
}
