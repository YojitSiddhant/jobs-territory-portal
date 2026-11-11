import { Prisma } from "@prisma/client";
import { requireRole } from "@/server/auth/authorization";
import { requireApprovedCompany } from "@/server/companies/company-profile";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { applicationStatusSchema } from "@/shared/validation/application";
import { applicationSelect, assertApplicationTransition, serializeApplication } from "@/server/applications/application-management";

export async function PATCH(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const user = await requireRole("COMPANY"); const company = await requireApprovedCompany(user.id); const { applicationId } = await params;
    const input = applicationStatusSchema.parse(await request.json());
    const existing = await prisma.application.findFirst({ where: { id: applicationId, job: { companyId: company.id } }, select: { id: true, status: true } });
    if (!existing) return Response.json({ error: { code: "APPLICATION_NOT_FOUND", message: "Application not found." } }, { status: 404 });
    assertApplicationTransition(existing.status, input.status);
    const application = await prisma.$transaction(async (tx) => {
      await tx.application.update({ where: { id: applicationId }, data: { status: input.status } });
      await tx.applicationStatusHistory.create({ data: { applicationId, status: input.status, actorId: user.id } });
      return tx.application.findUniqueOrThrow({ where: { id: applicationId }, select: applicationSelect });
    });
    return apiSuccess({ application: serializeApplication(application) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: { code: "APPLICATION_NOT_FOUND", message: "Application not found." } }, { status: 404 });
    return apiError(error);
  }
}
