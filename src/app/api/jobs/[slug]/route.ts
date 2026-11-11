import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { getPublicJob, serializePublicJob } from "@/server/jobs/public-discovery";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const job = await getPublicJob(slug);
    if (!job) return Response.json({ error: { code: "JOB_NOT_FOUND", message: "Published job was not found." } }, { status: 404 });
    const user = await getSessionUser();
    let hasApplied = false;
    if (user?.role === "CANDIDATE") {
      const application = await prisma.application.findUnique({ where: { jobId_candidateId: { jobId: job.id, candidateId: user.id } }, select: { id: true } });
      hasApplied = Boolean(application);
    }
    return apiSuccess({ job: serializePublicJob(job), application: { hasApplied } });
  } catch (error) {
    return apiError(error);
  }
}
