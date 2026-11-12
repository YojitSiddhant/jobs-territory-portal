import { requireAuthenticatedUser, requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { getPrivateStorage, isPrivateObjectKey, type PrivateDownload } from "@/server/storage/private-storage";
import { apiError } from "@/server/http/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const key = (await params).key.join("/");
    if (!isPrivateObjectKey(key)) return Response.json({ error: { code: "FILE_NOT_FOUND", message: "Private file not found." } }, { status: 404 });
    const parts = key.split("/");
    const isCandidateFile = parts[1] === "candidates";
    if (isCandidateFile) {
      await requireRole("CANDIDATE");
      if (parts[2] !== user.id) return Response.json({ error: { code: "FORBIDDEN", message: "You cannot access this file." } }, { status: 403 });
      const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { profilePhotoKey: true, resumeKey: true } });
      if (!profile || (profile.profilePhotoKey !== key && profile.resumeKey !== key)) return Response.json({ error: { code: "FILE_NOT_FOUND", message: "Private file not found." } }, { status: 404 });
    }
    if (!isCandidateFile) {
      const company = await prisma.company.findUnique({ where: { id: parts[2] }, select: { ownerId: true } });
      if (!company || (company.ownerId !== user.id && user.role !== "ADMIN")) return Response.json({ error: { code: "FORBIDDEN", message: "You cannot access this file." } }, { status: 403 });
    }
    let object: PrivateDownload;
    try {
      object = await getPrivateStorage().get(key);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return Response.json({ error: { code: "FILE_NOT_FOUND", message: "Private file not found." } }, { status: 404 });
      throw error;
    }
    const download = new URL(request.url).searchParams.get("download") === "1";
    return new Response(Buffer.from(object.body), { headers: { "Content-Type": object.contentType, "Content-Disposition": `${download ? "attachment" : "inline"}; filename="private-file"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return apiError(error); }
}
