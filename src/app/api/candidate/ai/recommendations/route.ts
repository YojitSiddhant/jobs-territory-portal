import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { assertAiRateLimit } from "@/server/ai/rate-limit";
import { publicJobContext } from "@/server/ai/context";
import { recommendJobs } from "@/server/ai/service";

export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    assertAiRateLimit(user.id, "recommendations");
    const jobs = await prisma.job.findMany({ where: { status: "PUBLISHED", company: { status: "APPROVED" }, OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }] }, orderBy: { publishedAt: "desc" }, take: 50, select: { id: true, title: true, description: true, location: true, workplaceType: true, employmentType: true, experienceRequirement: true, requiredSkills: true, slug: true, company: { select: { name: true } } } });
    const recommendations = await recommendJobs(user.id, jobs.map(publicJobContext));
    const byId = new Map(jobs.map((job) => [job.id, job]));
    return apiSuccess({ recommendations: recommendations.map((item) => ({ ...item, job: byId.get(item.jobId) && { id: byId.get(item.jobId)!.id, slug: byId.get(item.jobId)!.slug, title: byId.get(item.jobId)!.title, company: byId.get(item.jobId)!.company.name, location: byId.get(item.jobId)!.location } })) });
  } catch (error) { return apiError(error); }
}
