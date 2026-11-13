import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/http/api-error";
import { apiSuccess } from "@/server/http/api-response";

export async function GET(request: Request) {
  try {
    void request.url;
    await requireRole("ADMIN");
    const grouped = await prisma.company.groupBy({ by: ["status"], where: { OR: [{ status: { not: "PENDING" } }, { status: "PENDING", verificationSubmittedAt: { not: null } }] }, _count: { _all: true } });
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0, SUSPENDED: 0 };
    for (const item of grouped) counts[item.status] = item._count._all;
    return apiSuccess({ counts });
  } catch (error) {
    return apiError(error);
  }
}
