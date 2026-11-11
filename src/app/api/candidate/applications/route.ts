import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";
import { applicationSelect, serializeApplication } from "@/server/applications/application-management";

export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    const applications = await prisma.application.findMany({ where: { candidateId: user.id }, select: applicationSelect, orderBy: { createdAt: "desc" } });
    return apiSuccess({ applications: applications.map(serializeApplication) });
  } catch (error) { return apiError(error); }
}
