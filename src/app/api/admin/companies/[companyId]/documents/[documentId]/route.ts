import { requireRole } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";
import { getPrivateStorage, type PrivateDownload } from "@/server/storage/private-storage";
import { apiError } from "@/server/http/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ companyId: string; documentId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { companyId, documentId } = await params;
    const document = await prisma.verificationDocument.findFirst({ where: { id: documentId, companyId }, select: { storageKey: true, mimeType: true, originalName: true } });
    if (!document) return Response.json({ error: { code: "DOCUMENT_NOT_FOUND", message: "Document was not found." } }, { status: 404 });
    let object: PrivateDownload;
    try { object = await getPrivateStorage().get(document.storageKey); } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return Response.json({ error: { code: "FILE_NOT_FOUND", message: "Private file not found." } }, { status: 404 });
      throw error;
    }
    const download = new URL(request.url).searchParams.get("download") === "1";
    return new Response(Buffer.from(object.body), { headers: { "Content-Type": document.mimeType, "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${document.originalName.replace(/[^a-zA-Z0-9._-]/g, "-")}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return apiError(error); }
}
