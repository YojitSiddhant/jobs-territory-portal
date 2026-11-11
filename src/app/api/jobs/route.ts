import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const jobs = await prisma.job.findMany({ where: { status: "PUBLISHED", OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }], ...(url.searchParams.get("q") ? { title: { contains: url.searchParams.get("q")! } } : {}) }, select: { id: true, slug: true, title: true, description: true, location: true, workplaceType: true, employmentType: true, experienceRequirement: true, requiredSkills: true, salaryMin: true, salaryMax: true, applicationDeadline: true, publishedAt: true, company: { select: { id: true, name: true, industry: true } } }, orderBy: { publishedAt: "desc" } });
    return apiSuccess({ jobs });
  } catch (error) {
    return apiError(error);
  }
}
