import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { getPrivateStorage, isPrivateObjectKey } from "@/server/storage/private-storage";
import { apiError } from "@/server/http/api-error";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const key = (await params).key.join("/");
    if (!isPrivateObjectKey(key)) return Response.json({ error: { code: "FILE_NOT_FOUND", message: "Private file not found." } }, { status: 404 });
    const parts = key.split("/");
    const isCandidateFile = parts[1] === "candidates";
    if (isCandidateFile && parts[2] !== user.id) return Response.json({ error: { code: "FORBIDDEN", message: "You cannot access this file." } }, { status: 403 });
    if (!isCandidateFile) {
      const company = await prisma.company.findUnique({ where: { id: parts[2] }, select: { ownerId: true } });
      if (!company || (company.ownerId !== user.id && user.role !== "ADMIN")) return Response.json({ error: { code: "FORBIDDEN", message: "You cannot access this file." } }, { status: 403 });
    }
    const object = await getPrivateStorage().get(key);
    return new Response(Buffer.from(object.body), { headers: { "Content-Type": object.contentType, "Content-Disposition": "attachment", "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
