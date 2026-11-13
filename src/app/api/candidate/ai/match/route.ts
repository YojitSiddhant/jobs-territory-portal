import { z } from "zod";
import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { assertAiRateLimit } from "@/server/ai/rate-limit";
import { matchCandidateToJob } from "@/server/ai/service";

const inputSchema = z.object({ jobId: z.string().cuid() });

export async function POST(request: Request) {
  try {
    const user = await requireRole("CANDIDATE");
    assertAiRateLimit(user.id, "match");
    const { jobId } = inputSchema.parse(await request.json());
    const job = await prisma.job.findFirst({ where: { id: jobId, status: "PUBLISHED", company: { status: "APPROVED" }, OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }] }, select: { id: true, title: true, description: true, location: true, workplaceType: true, employmentType: true, experienceRequirement: true, requiredSkills: true, company: { select: { name: true } } } });
    if (!job) return Response.json({ error: { code: "JOB_NOT_FOUND", message: "This job is no longer available." } }, { status: 404 });
    return apiSuccess({ match: await matchCandidateToJob(user.id, job) });
  } catch (error) { return apiError(error); }
}
