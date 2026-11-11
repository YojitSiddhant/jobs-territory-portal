import { Prisma } from "@prisma/client";
import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { applicationCreateSchema } from "@/shared/validation/application";
import { hasUsableCandidateProfile, isApplyableJob, serializeApplication, applicationSelect } from "@/server/applications/application-management";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await requireRole("CANDIDATE");
    const input = applicationCreateSchema.parse(await request.json());
    const { slug } = await params;
    const job = await prisma.job.findFirst({ where: { slug }, select: { id: true, status: true, applicationDeadline: true, company: { select: { status: true } } } });
    if (!job || !isApplyableJob({ ...job, companyStatus: job.company.status })) return Response.json({ error: { code: "JOB_NOT_AVAILABLE", message: "This job is not accepting applications." } }, { status: 404 });
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { fullName: true, resumeKey: true } });
    if (!hasUsableCandidateProfile(profile)) return Response.json({ error: { code: "PROFILE_INCOMPLETE", message: "Complete your profile and add a resume before applying." } }, { status: 400 });
    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({ data: { jobId: job.id, candidateId: user.id, resumeKey: profile!.resumeKey!, coverNote: input.coverNote ?? null, status: "APPLIED" }, select: { id: true } });
      await tx.applicationStatusHistory.create({ data: { applicationId: created.id, status: "APPLIED", actorId: user.id } });
      return tx.application.findUniqueOrThrow({ where: { id: created.id }, select: applicationSelect });
    });
    return apiSuccess({ application: serializeApplication(application) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: { code: "DUPLICATE_APPLICATION", message: "You have already applied to this job." } }, { status: 409 });
    return apiError(error);
  }
}
